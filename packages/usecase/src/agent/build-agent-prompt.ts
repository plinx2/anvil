import type { Role, Ticket } from '@anvil/entity';
import type { FindProject } from '../find/find-project';
import type { ContextStore, EntryStore, RoleDefinitions } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface BuildAgentPromptInput {
  ticket: Ticket;
  role: Role;
  handoff?: string;
  note?: string;
}

export interface BuildAgentPromptOutput {
  prompt: string;
  /** プロンプトが指す、作業ディレクトリの外の場所(プロジェクトコンテキスト) */
  addDirs: string[];
}

/** エージェントに最初に渡す入力を作る。ロールの定義(本文)、プロジェクトコンテキスト、チケット、直近 3 件のエントリ。 */
export class BuildAgentPrompt implements UseCase<BuildAgentPromptInput, BuildAgentPromptOutput> {
  constructor(
    private readonly entries: EntryStore,
    private readonly context: ContextStore,
    private readonly roleDefinitions: RoleDefinitions,
    private readonly findProject: FindProject,
  ) {}

  async execute(ctx: RequestContext, input: BuildAgentPromptInput): Promise<BuildAgentPromptOutput> {
    const { ticket, role } = input;
    const { project } = await this.findProject.execute(ctx, { projectId: ticket.projectId });
    const recent = (await this.entries.list(ctx, ticket.id)).slice(-3);
    const total = await this.entries.count(ctx, ticket.id);
    const readsCodingPrinciples = role.id === 'coder' || role.id === 'reviewer';

    const lines = [
      `あなたは anvil のチケット T-${ticket.id}「${ticket.title}」の ${role.label} です。状態は「${ticket.state.label}」です。`,
      '',
      '## ロールの定義',
      this.roleDefinitions.roleDoc(ctx, role),
      ...(readsCodingPrinciples ? ['', '## コーディングの原則', this.roleDefinitions.codingPrinciples(ctx)] : []),
      '',
      '## まず読むもの',
      `- プロジェクトコンテキストの入口: ${this.context.indexPath(ctx, project.name)}`,
      `- このロールのプロジェクトコンテキスト(あれば): ${this.context.rolePagePath(ctx, project.name, role)}`,
      '',
      '## チケット',
      `種別: ${ticket.kind.id} / SP: ${ticket.sp ?? '未設定'} / デザイン: ${ticket.designNeeded ? '要' : '不要'} / slug: ${ticket.slug} / 対象リポジトリ: ${ticket.targetRepos.join(', ') || '未設定'}`,
      '',
      ticket.body || '(内容なし)',
      '',
      `## エントリ(総件数 ${total} 件。直近 ${recent.length} 件を示す。全件は anvil_read_entries で読める)`,
      ...recent.map((e) => `--- [${e.state.label} / ${e.role}${e.authorKind === 'human' ? '(人間)' : ''} / ${e.createdAt}]\n${e.body}`),
    ];
    if (input.handoff) lines.push('', '## 申し送り', input.handoff);
    if (input.note) lines.push('', '## 補足', input.note);
    lines.push(
      '',
      '## 作業のルール',
      '- anvil の操作は MCP ツール(anvil_*)で行う。',
      '- 成果物、申し送り、質問は、すべてエントリの本文に書く(anvil_add_entry)。',
      '- 人間の判断が欲しいときは、迷わず anvil_ask で承認待ちフラグを立てて待つ。ゲートの判断は自分でしない。',
      '- 作業が終わったら、先に anvil_save_reflection で振り返りを保存し、そのあと anvil_advance を呼ぶ(呼ぶと、あなたは終了される)。',
      '- 問題を見つけたら、anvil_rollback で差し戻せる(理由は必須)。',
    );
    return { prompt: lines.join('\n'), addDirs: [this.context.dirPath(ctx, project.name)] };
  }
}
