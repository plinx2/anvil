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

/** PR の作成・更新(anvil が行う)。本文は、PullRequestBodyWriter が作る。 */
export interface PullRequestPort {
  createOrUpdate(ctx: RequestContext, request: PullRequestRequest): Promise<string>;
}
