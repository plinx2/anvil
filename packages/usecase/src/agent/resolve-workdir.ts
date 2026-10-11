import type { Ticket } from '@anvil/entity';
import type { FindProject } from '../find/find-project';
import type { BranchStore, RepoStore, Workspace } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface ResolveWorkdirInput {
  ticket: Ticket;
}

export interface ResolveWorkdirOutput {
  workdir: string;
}

/** エージェントを動かす作業場所。ブランチを切った後は、ワークツリー。それまでは、対象のリポジトリ。 */
export class ResolveWorkdir implements UseCase<ResolveWorkdirInput, ResolveWorkdirOutput> {
  constructor(
    private readonly branches: BranchStore,
    private readonly repos: RepoStore,
    private readonly workspace: Workspace,
    private readonly findProject: FindProject,
  ) {}

  async execute(ctx: RequestContext, input: ResolveWorkdirInput): Promise<ResolveWorkdirOutput> {
    const { ticket } = input;
    if ((await this.branches.list(ctx, ticket.id)).length > 0) {
      const { project } = await this.findProject.execute(ctx, { projectId: ticket.projectId });
      return { workdir: this.workspace.worktreeRoot(ctx, project.name, ticket.slug) };
    }
    const repos = await this.repos.listByProject(ctx, ticket.projectId);
    const target = repos.find((r) => r.name === ticket.targetRepos[0]) ?? repos[0];
    return { workdir: target?.path ?? this.workspace.homeDir(ctx) };
  }
}
