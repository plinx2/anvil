import type { RequestContext } from '../request-context';

export interface PullRequestRequest {
  readonly repoPath: string;
  readonly repoName: string;
  readonly branch: string;
  readonly base: string;
  readonly title: string;
  /** 本文の材料(チケットのエントリなど) */
  readonly material: string;
  /** 既にあれば、更新する */
  readonly existingUrl?: string;
}

/** PR の、今の状態 */
export interface PullRequestState {
  /** `OPEN` | `CLOSED` | `MERGED`。未知の値も、そのまま返す */
  readonly state: string;
  /** PR の先頭コミットの SHA */
  readonly headRefOid: string;
}

/** PR の作成・更新(anvil が行う)。本文は、PullRequestBodyWriter が作る。 */
export interface PullRequestPort {
  createOrUpdate(ctx: RequestContext, request: PullRequestRequest): Promise<string>;
  /** PR の状態を取る。取れなかったら、例外 */
  getState(ctx: RequestContext, prUrl: string): Promise<PullRequestState>;
}
