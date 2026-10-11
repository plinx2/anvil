import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { PullRequestBodyWriter, PullRequestPort, PullRequestRequest, PullRequestState, RequestContext } from '@anvil/usecase';

const run = promisify(execFile);

/**
 * `git push` と、GitHub の `gh` コマンドで、PR を作る・更新する(実機で未検証)。
 * 本文は、背景ロール(PullRequestBodyWriter)が作る。
 */
export class GhCliPullRequests implements PullRequestPort {
  constructor(
    private readonly bodyWriter: PullRequestBodyWriter,
    /** gh コマンド。args は bin に先立って渡す引数(テストで、node + 偽のスクリプトに差し替えるため) */
    private readonly gh: { readonly bin: string; readonly args: readonly string[] } = { bin: 'gh', args: [] },
  ) {}

  async createOrUpdate(ctx: RequestContext, request: PullRequestRequest): Promise<string> {
    const body = await this.bodyWriter.write(ctx, request.material);
    const options = { cwd: request.repoPath, windowsHide: true, maxBuffer: 16 * 1024 * 1024 };

    await run('git', ['push', '-u', 'origin', request.branch], options);
    if (request.existingUrl) {
      await run(this.gh.bin, [...this.gh.args, 'pr', 'edit', request.existingUrl, '--title', request.title, '--body', body], options);
      return request.existingUrl;
    }
    const { stdout } = await run(
      this.gh.bin,
      [...this.gh.args, 'pr', 'create', '--base', request.base, '--head', request.branch, '--title', request.title, '--body', body],
      options,
    );
    return stdout.trim().split(/\s+/).pop() ?? '';
  }

  async getState(_ctx: RequestContext, prUrl: string): Promise<PullRequestState> {
    const { stdout } = await run(this.gh.bin, [...this.gh.args, 'pr', 'view', prUrl, '--json', 'state,headRefOid'], {
      windowsHide: true,
      maxBuffer: 16 * 1024 * 1024,
    });
    const parsed = JSON.parse(stdout) as { state?: unknown; headRefOid?: unknown };
    if (typeof parsed.state !== 'string' || typeof parsed.headRefOid !== 'string') {
      throw new Error(`gh pr view の出力に state と headRefOid が無い: ${stdout.trim()}`);
    }
    return { state: parsed.state, headRefOid: parsed.headRefOid };
  }
}
