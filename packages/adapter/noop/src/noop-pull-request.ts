import type { PullRequestPort, PullRequestRequest, PullRequestState, RequestContext } from '@anvil/usecase';

/**
 * PR を作らずに、記録だけする(既定の構成と、テスト)。failWith を設定すると、作成を失敗させられる。
 * PR の状態は、states に URL ごとに入れる。入れていない URL は、取れなかった(失敗)ことになる。
 */
export class NoopPullRequest implements PullRequestPort {
  readonly calls: PullRequestRequest[] = [];
  readonly stateRequests: string[] = [];
  readonly states = new Map<string, PullRequestState | Error>();
  failWith: string | null = null;

  async createOrUpdate(_ctx: RequestContext, request: PullRequestRequest): Promise<string> {
    if (this.failWith) throw new Error(this.failWith);
    this.calls.push(request);
    return request.existingUrl ?? `dry-run://${request.repoName}/${request.branch}`;
  }

  async getState(_ctx: RequestContext, prUrl: string): Promise<PullRequestState> {
    this.stateRequests.push(prUrl);
    const state = this.states.get(prUrl);
    if (!state) throw new Error(`PR の状態が設定されていない: ${prUrl}`);
    if (state instanceof Error) throw state;
    return state;
  }
}
