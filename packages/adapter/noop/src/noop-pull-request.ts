import type { PullRequestPort, PullRequestRequest, RequestContext } from '@anvil/usecase';

/** PR を作らずに、記録だけする(既定の構成と、テスト)。failWith を設定すると、失敗させられる。 */
export class NoopPullRequest implements PullRequestPort {
  readonly calls: PullRequestRequest[] = [];
  failWith: string | null = null;

  async createOrUpdate(_ctx: RequestContext, request: PullRequestRequest): Promise<string> {
    if (this.failWith) throw new Error(this.failWith);
    this.calls.push(request);
    return request.existingUrl ?? `dry-run://${request.repoName}/${request.branch}`;
  }
}
