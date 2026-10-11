import type { Ticket } from '@anvil/entity';
import type { BranchStore, GitPort, Notifier, PullRequestPort, RepoStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface CleanUpWorktreesInput {
  ticket: Ticket;
}

export type CleanUpWorktreesOutput = Record<string, never>;

/** 作業ブランチを削除してよいか。よくないなら、その理由 */
export type BranchDeletionDecision = { readonly delete: true } | { readonly delete: false; readonly reason: string };

/** `decideBranchDeletion` の入力。取得に失敗したものは、失敗の理由(文字列)を持つ */
export interface BranchDeletionFacts {
  readonly prUrl: string | undefined;
  /** PR の状態。取れなかったときは `{ error }` */
  readonly pr: { readonly state: string; readonly headRefOid: string } | { readonly error: string } | undefined;
  /** ローカルの先頭コミット。ブランチが無いときは null */
  readonly localHead: string | null;
}

const shortSha = (sha: string): string => sha.slice(0, 7);

/**
 * PR のマージ済みの判定。squash マージでは、作業ブランチがベースの祖先にならないので、git ではなく PR の状態で判定する。
 * マージ後に追加したコミットを消さないよう、ローカルの先頭コミットが PR の先頭コミットと一致することも求める。
 */
export function decideBranchDeletion(facts: BranchDeletionFacts): BranchDeletionDecision {
  if (!facts.prUrl) return { delete: false, reason: 'チケットに PR の URL が無い' };
  if (!facts.pr) return { delete: false, reason: 'PR の状態を確かめていない' };
  if ('error' in facts.pr) return { delete: false, reason: `gh で PR の状態を取れなかった: ${facts.pr.error}` };
  if (facts.pr.state === 'OPEN') return { delete: false, reason: 'PR がまだマージされていない(OPEN)' };
  if (facts.pr.state === 'CLOSED') return { delete: false, reason: 'PR がマージされずに閉じられている(CLOSED)' };
  if (facts.pr.state !== 'MERGED') return { delete: false, reason: `PR の状態が不明(${facts.pr.state})` };
  if (facts.localHead === null) return { delete: false, reason: 'ローカルの先頭コミットを取得できなかった' };

  const local = facts.localHead.toLowerCase();
  const remote = facts.pr.headRefOid.toLowerCase();
  if (local !== remote) {
    return {
      delete: false,
      reason: `マージ後にコミットが追加されている(ローカル ${shortSha(local)}、PR ${shortSha(remote)})`,
    };
  }
  return { delete: true };
}

/**
 * チケットの完了時に、ワークツリーを削除し、作業を元のリポジトリへ反映する。
 * - リモートが無い: ベースブランチへ作業ブランチを取り込み、作業ブランチを削除する。
 * - リモートがある: PR でマージされるので、ベースブランチを pull する。
 *   PR がマージ済みで、マージ後のコミットが無いと確かめられたときだけ、作業ブランチ(ローカルと origin)を削除する。
 *   確かめられないときは、消さずに人間に知らせる。
 * コンフリクトなど、人間の判断が要るときは、何も壊さずに(作業ブランチは残して)人間に知らせる。
 * 完了そのものは、失敗させない。
 */
export class CleanUpWorktrees implements UseCase<CleanUpWorktreesInput, CleanUpWorktreesOutput> {
  constructor(
    private readonly branches: BranchStore,
    private readonly repos: RepoStore,
    private readonly git: GitPort,
    private readonly pullRequests: PullRequestPort,
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
        continue;
      }

      if (repo.hasRemote) await this.deleteMergedBranch(ctx, ticket, repo, branch.branch);
    }
    return {};
  }

  private async deleteMergedBranch(
    ctx: RequestContext,
    ticket: Ticket,
    repo: { name: string; path: string },
    branch: string,
  ): Promise<void> {
    const decision = await this.decide(ctx, ticket, repo, branch);
    if (!decision.delete) {
      await this.notifier.notify(
        ctx,
        `T-${ticket.id} の作業ブランチを削除せず残した`,
        `${repo.name}: ${decision.reason}(ブランチ ${branch})`,
      );
      return;
    }

    // ローカルが失敗しても、リモートは試みる(逆も同じ)
    await this.deleteBranchSide(ctx, ticket, repo.name, branch, 'ローカル', () => this.git.deleteLocalBranch(ctx, repo.path, branch));
    await this.deleteBranchSide(ctx, ticket, repo.name, branch, 'リモート', () => this.git.deleteRemoteBranch(ctx, repo.path, branch));
  }

  private async decide(
    ctx: RequestContext,
    ticket: Ticket,
    repo: { name: string; path: string },
    branch: string,
  ): Promise<BranchDeletionDecision> {
    const prUrl = ticket.prUrls[repo.name];
    if (!prUrl) return decideBranchDeletion({ prUrl, pr: undefined, localHead: null });

    const pr = await this.pullRequests.getState(ctx, prUrl).catch((e: unknown) => ({ error: (e as Error).message }));
    const localHead = await this.git.getBranchHead(ctx, repo.path, branch).catch(() => null);
    return decideBranchDeletion({ prUrl, pr, localHead });
  }

  private async deleteBranchSide(
    ctx: RequestContext,
    ticket: Ticket,
    repoName: string,
    branch: string,
    side: 'ローカル' | 'リモート',
    remove: () => Promise<void>,
  ): Promise<void> {
    try {
      await remove();
    } catch (e) {
      await this.notifier.notify(
        ctx,
        `T-${ticket.id} の作業ブランチを削除できなかった`,
        `${repoName}: ${side}の削除に失敗: ${(e as Error).message}(ブランチ ${branch})`,
      );
    }
  }
}
