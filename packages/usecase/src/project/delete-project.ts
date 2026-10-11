import { AnvilError } from '@anvil/entity';
import type { EndAgents } from '../agent/end-agents';
import type { FindProject } from '../find/find-project';
import type {
  AgentConfigWriter,
  AgentRuntime,
  BranchStore,
  Clock,
  DependencyStore,
  EntryStore,
  GitPort,
  HistoryStore,
  IntakeStore,
  LaunchStore,
  Notifier,
  ProjectStore,
  ReflectionStore,
  RepoStore,
  TicketStore,
  Transactor,
  Workspace,
} from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface DeleteProjectInput {
  projectId: number;
  /** 取り違えを防ぐため、プロジェクトの名前をそのまま書く */
  confirmName: string;
}

export interface DeleteProjectOutput {
  tickets: number;
  repos: number;
  intakes: number;
  /** 残したブランチ(リポジトリ名:ブランチ名)。リポジトリそのものと、ブランチには触れない */
  keptBranches: string[];
}

/**
 * プロジェクトの削除。プロジェクトに関わるデータを、すべて消す。
 * チケット(エントリ、履歴、起動の記録、ブランチの記録、依存、振り返り)、起票の依頼、リポジトリの登録、
 * 稼働中のエージェント、ワークツリーとプロジェクトコンテキスト、エージェントに渡した MCP の設定。
 * 消さないもの: リポジトリそのもの(ローカルのパス)と、その中のブランチ(未マージの作業を失わないため)。
 */
export class DeleteProject implements UseCase<DeleteProjectInput, DeleteProjectOutput> {
  constructor(
    private readonly projects: ProjectStore,
    private readonly repos: RepoStore,
    private readonly tickets: TicketStore,
    private readonly entries: EntryStore,
    private readonly history: HistoryStore,
    private readonly launches: LaunchStore,
    private readonly branches: BranchStore,
    private readonly dependencies: DependencyStore,
    private readonly reflections: ReflectionStore,
    private readonly intakes: IntakeStore,
    private readonly agents: AgentRuntime,
    private readonly agentConfig: AgentConfigWriter,
    private readonly git: GitPort,
    private readonly workspace: Workspace,
    private readonly notifier: Notifier,
    private readonly transactor: Transactor,
    private readonly clock: Clock,
    private readonly findProject: FindProject,
    private readonly endAgents: EndAgents,
  ) {}

  async execute(ctx: RequestContext, input: DeleteProjectInput): Promise<DeleteProjectOutput> {
    const { project } = await this.findProject.execute(ctx, { projectId: input.projectId });
    if (input.confirmName !== project.name) {
      throw AnvilError.invalid('confirmName が、プロジェクトの名前と一致しない(取り違え防止)');
    }

    const repos = await this.repos.listByProject(ctx, project.id);
    const tickets = await this.tickets.list(ctx, { projectId: project.id });
    const intakes = await this.intakes.listByProject(ctx, project.id);
    const intakeItems = (await Promise.all(intakes.map((i) => this.intakes.items(ctx, i.id)))).flat();

    // 稼働中のエージェントを止め、ワークツリーを消す(ブランチは残す)
    const keptBranches: string[] = [];
    for (const ticket of tickets) {
      await this.endAgents.execute(ctx, { ticketId: ticket.id });
      for (const branch of await this.branches.list(ctx, ticket.id)) {
        keptBranches.push(`${branch.repoName}:${branch.branch}`);
        const repo = repos.find((r) => r.name === branch.repoName);
        if (repo) await this.git.removeWorktree(ctx, repo.path, branch.worktreePath).catch(() => undefined);
      }
    }
    for (const item of intakeItems) {
      for (const launch of await this.launches.activeByIntakeItem(ctx, item.id)) {
        await this.launches.end(ctx, launch.id, this.clock.now(ctx));
        await this.agents.stop(ctx, launch.name).catch(() => undefined);
      }
    }

    await this.transactor.transaction(ctx, async (tx) => {
      for (const ticket of tickets) {
        await this.entries.deleteByTicket(tx, ticket.id);
        await this.history.deleteByTicket(tx, ticket.id);
        await this.launches.deleteByTicket(tx, ticket.id);
        await this.branches.deleteByTicket(tx, ticket.id);
        await this.dependencies.deleteByTicket(tx, ticket.id);
        await this.reflections.deleteByTicket(tx, ticket.id);
        await this.tickets.delete(tx, ticket.id);
      }
      for (const item of intakeItems) await this.launches.deleteByIntakeItem(tx, item.id);
      await this.intakes.deleteByProject(tx, project.id);
      await this.repos.deleteByProject(tx, project.id);
      await this.projects.delete(tx, project.id);
    });

    // ファイル(データベースの後。失敗しても、記録は消えている)
    for (const ticket of tickets) await this.agentConfig.removeByPrefix(ctx, `t${ticket.id}-`);
    for (const intake of intakes) await this.agentConfig.removeByPrefix(ctx, `intake${intake.id}-`);
    await this.workspace.removeProjectDir(ctx, project.name);

    if (keptBranches.length > 0) {
      await this.notifier.notify(ctx, 'プロジェクトを削除', `${project.name}: ブランチは残してある(${keptBranches.join(', ')})`);
    }
    return { tickets: tickets.length, repos: repos.length, intakes: intakes.length, keptBranches };
  }
}
