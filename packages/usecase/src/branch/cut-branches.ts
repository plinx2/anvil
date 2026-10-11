import { AnvilError, type Repo, type Ticket } from '@anvil/entity';
import type { FindProject } from '../find/find-project';
import type { BranchStore, GitPort, RepoStore, Workspace } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface CutBranchesInput {
  ticket: Ticket;
}

export type CutBranchesOutput = Record<string, never>;

/**
 * 対象のリポジトリの全部に、slug の名前でブランチを切り、ワークツリーを作る。
 * 既にあるブランチ(差し戻しのあとの再突破)は、再利用する。他のチケットのブランチと衝突したら、突破を止める。
 */
export class CutBranches implements UseCase<CutBranchesInput, CutBranchesOutput> {
  constructor(
    private readonly branches: BranchStore,
    private readonly repos: RepoStore,
    private readonly git: GitPort,
    private readonly workspace: Workspace,
    private readonly findProject: FindProject,
  ) {}

  async execute(ctx: RequestContext, input: CutBranchesInput): Promise<CutBranchesOutput> {
    const { ticket } = input;
    const { project } = await this.findProject.execute(ctx, { projectId: ticket.projectId });
    const repos = await this.repos.listByProject(ctx, ticket.projectId);
    const alreadyCut = new Set((await this.branches.list(ctx, ticket.id)).map((b) => b.repoName));

    // 先に、衝突を全部確かめる(途中まで切って止まらないように)
    const plan: Array<{ repo: Repo; reuse: boolean }> = [];
    for (const name of ticket.targetRepos) {
      const repo = repos.find((r) => r.name === name);
      if (!repo) throw AnvilError.notFound(`リポジトリが無い: ${name}`);
      if (!alreadyCut.has(name) && (await this.git.branchExists(ctx, repo.path, ticket.slug))) {
        throw AnvilError.conflict(`同名のブランチが既にある: ${ticket.slug}(${name})。突破を止めた`);
      }
      plan.push({ repo, reuse: alreadyCut.has(name) });
    }

    for (const { repo, reuse } of plan) {
      const worktreePath = this.workspace.repoWorktree(ctx, project.name, ticket.slug, repo.name);
      await this.git.ensureBranchAndWorktree(ctx, {
        repoPath: repo.path,
        base: repo.defaultBranch,
        branch: ticket.slug,
        worktreePath,
        reuse,
      });
      await this.branches.upsert(ctx, { ticketId: ticket.id, repoName: repo.name, branch: ticket.slug, worktreePath });
    }
    return {};
  }
}
