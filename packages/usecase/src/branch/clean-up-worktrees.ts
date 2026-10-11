import type { Ticket } from '@anvil/entity';
import type { BranchStore, GitPort, Notifier, RepoStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface CleanUpWorktreesInput {
  ticket: Ticket;
}

export type CleanUpWorktreesOutput = Record<string, never>;

/**
 * チケットの完了時に、ワークツリーを削除し、作業を元のリポジトリへ反映する。
 * - リモートが無い: ベースブランチへ作業ブランチを取り込み、作業ブランチを削除する。
 * - リモートがある: PR でマージされるので、ベースブランチを pull する。
 * コンフリクトなど、人間の判断が要るときは、何も壊さずに(作業ブランチは残して)人間に知らせる。
 */
export class CleanUpWorktrees implements UseCase<CleanUpWorktreesInput, CleanUpWorktreesOutput> {
  constructor(
    private readonly branches: BranchStore,
    private readonly repos: RepoStore,
    private readonly git: GitPort,
    private readonly notifier: Notifier,
  ) {}

  async execute(ctx: RequestContext, input: CleanUpWorktreesInput): Promise<CleanUpWorktreesOutput> {
    const { ticket } = input;
    const repos = await this.repos.listByProject(ctx, ticket.projectId);
    for (const branch of await this.branches.list(ctx, ticket.id)) {
      const repo = repos.find((r) => r.name === branch.repoName);
      if (!repo) continue;
      try {
        await this.git.removeWorktree(ctx, repo.path, branch.worktreePath);
      } catch (e) {
        await this.notifier.notify(
          ctx,
          `T-${ticket.id} のワークツリーを削除できなかった`,
          `${branch.worktreePath}: ${(e as Error).message}`,
        );
      }

      const outcome = repo.hasRemote
        ? await this.git.pullBase(ctx, repo.path, repo.defaultBranch)
        : await this.git.integrateBranch(ctx, repo.path, repo.defaultBranch, branch.branch);
      if (!outcome.ok) {
        await this.notifier.notify(
          ctx,
          `T-${ticket.id} の反映に失敗`,
          `${repo.name}: ${outcome.reason}(ブランチ ${branch.branch} は残してある)`,
        );
      }
    }
    return {};
  }
}
