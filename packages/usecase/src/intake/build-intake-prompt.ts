import { type IntakeItem, Role, type Ticket } from '@anvil/entity';
import type { ContextStore, RoleDefinitions } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface BuildIntakePromptInput {
  item: IntakeItem;
  projectName: string;
  /** 分割元(破棄されるかもしれない) */
  source: Ticket | null;
}

export interface BuildIntakePromptOutput {
  prompt: string;
  /** プロンプトが指す、作業ディレクトリの外の場所(プロジェクトコンテキスト) */
  addDirs: string[];
}

/** PBI 起票担当に最初に渡す入力。やりたいことを、タイトル・ペイン・ゲイン・AC に整えて、起票させる。 */
export class BuildIntakePrompt implements UseCase<BuildIntakePromptInput, BuildIntakePromptOutput> {
  constructor(
    private readonly context: ContextStore,
    private readonly roleDefinitions: RoleDefinitions,
  ) {}

  async execute(ctx: RequestContext, input: BuildIntakePromptInput): Promise<BuildIntakePromptOutput> {
    const { item, projectName, source } = input;
    const prompt = [
      `あなたは anvil の ${Role.PBI_AUTHOR.label} です。次の「やりたいこと」を、タイトル・ペイン・ゲイン・AC に整えて、人間と会話しながら起票してください。`,
      '',
      '## ロールの定義',
      this.roleDefinitions.roleDoc(ctx, Role.PBI_AUTHOR),
      '',
      '## まず読むもの',
      `- プロジェクトコンテキストの入口: ${this.context.indexPath(ctx, projectName)}`,
      `- このロールのプロジェクトコンテキスト(あれば): ${this.context.rolePagePath(ctx, projectName, Role.PBI_AUTHOR)}`,
      '',
      '## やりたいこと',
      item.wish,
      '',
      `種別: ${item.kind.id} / 開始状態: ${item.startState?.label ?? '既定'} / slug: ${item.slug ?? '未指定(内容から考える)'} / 自動ゲート承認: ${item.autoGate ? 'ON' : 'OFF'} / 依存先: ${JSON.stringify(item.dependsOn)}`,
      ...(source ? ['', `分割元(破棄されるかもしれない): T-${source.id}「${source.title}」`] : []),
      '',
      '起票は anvil_create_ticket で行う。起票したら、あなたは終了される。',
    ].join('\n');
    return { prompt, addDirs: [this.context.dirPath(ctx, projectName)] };
  }
}
