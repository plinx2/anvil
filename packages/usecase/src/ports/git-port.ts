import type { RequestContext } from '../request-context';

export interface WorktreeRequest {
  readonly repoPath: string;
  /** ブランチを切る元 */
  readonly base: string;
  readonly branch: string;
  readonly worktreePath: string;
  /** 既にあるブランチを、再利用する(差し戻しのあとの、再突破) */
  readonly reuse: boolean;
}

/** 元のリポジトリでの操作の結果。失敗は例外にせず、理由を返す(人間に知らせて、判断してもらう) */
export type GitOutcome = { readonly ok: true } | { readonly ok: false; readonly reason: string };

export interface GitPort {
  branchExists(ctx: RequestContext, repoPath: string, branch: string): Promise<boolean>;
  /** ブランチを切り、ワークツリーを作る。 */
  ensureBranchAndWorktree(ctx: RequestContext, request: WorktreeRequest): Promise<void>;
  /** ワークツリーだけ削除する(ブランチは残す) */
  removeWorktree(ctx: RequestContext, repoPath: string, worktreePath: string): Promise<void>;
  /**
   * リモートが無いとき: 元のリポジトリのベースブランチへ作業ブランチを取り込み、作業ブランチを削除する。
   * コンフリクトしたら取り込みを中止して、ブランチを残す。ベースブランチをチェックアウトしていない、未コミットの変更がある、ときも何もしない。
   */
  integrateBranch(ctx: RequestContext, repoPath: string, base: string, branch: string): Promise<GitOutcome>;
  /** リモートがあるとき(PR でマージされた後): 元のリポジトリのベースブランチを pull する(早送りだけ。コンフリクトの解決はしない) */
  pullBase(ctx: RequestContext, repoPath: string, base: string): Promise<GitOutcome>;
  /** ローカルブランチの先頭コミットの SHA(完全な長さ)。ブランチが無ければ null */
  getBranchHead(ctx: RequestContext, repoPath: string, branch: string): Promise<string | null>;
  /** ローカルブランチを、マージ済みかどうかによらず削除する(呼ぶ側が、消してよいと確かめてから呼ぶ)。失敗は例外 */
  deleteLocalBranch(ctx: RequestContext, repoPath: string, branch: string): Promise<void>;
  /** `origin` のブランチを削除する。既に無ければ、何もせず成功。失敗は例外 */
  deleteRemoteBranch(ctx: RequestContext, repoPath: string, branch: string): Promise<void>;
}
