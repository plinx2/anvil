import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import type { GitOutcome, GitPort, RequestContext, WorktreeRequest } from '@anvil/usecase';

const run = promisify(execFile);

/** git の失敗から、理由の 1 行目(stderr があればそれ)を取り出す */
function firstLine(e: unknown): string {
  const { stderr, message } = e as { stderr?: string; message?: string };
  return ((stderr || message || '').trim().split('\n')[0] ?? '').trim();
}

/** ワークツリーへ写す、gitignore 済みファイルの一覧(.gitignore と同じ書き方) */
const WORKTREE_INCLUDE = '.worktreeinclude';

/** `git` コマンドで、ブランチとワークツリーを扱う。 */
export class GitCli implements GitPort {
  async branchExists(_ctx: RequestContext, repoPath: string, branch: string): Promise<boolean> {
    try {
      await this.git(repoPath, ['rev-parse', '--verify', '--quiet', `refs/heads/${branch}`]);
      return true;
    } catch {
      return false;
    }
  }

  async ensureBranchAndWorktree(ctx: RequestContext, request: WorktreeRequest): Promise<void> {
    const exists = await this.branchExists(ctx, request.repoPath, request.branch);
    if (exists && !request.reuse) throw new Error(`同名のブランチが既にある: ${request.branch}(${request.repoPath})`);

    fs.mkdirSync(path.dirname(request.worktreePath), { recursive: true });
    if (fs.existsSync(request.worktreePath)) return;
    if (exists) {
      await this.git(request.repoPath, ['worktree', 'add', request.worktreePath, request.branch]);
    } else {
      await this.git(request.repoPath, ['worktree', 'add', '-b', request.branch, request.worktreePath, request.base]);
    }
    await this.copyWorktreeIncludes(request.repoPath, request.worktreePath);
  }

  async removeWorktree(_ctx: RequestContext, repoPath: string, worktreePath: string): Promise<void> {
    if (fs.existsSync(worktreePath)) {
      await this.git(repoPath, ['worktree', 'remove', '--force', worktreePath]).catch(() => undefined);
      // git が消しきれないことがある(Windows の node_modules など)。残骸は、ディレクトリごと消す
      fs.rmSync(worktreePath, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
    }
    await this.git(repoPath, ['worktree', 'prune']).catch(() => undefined);
    // ワークツリーは <worktrees>/<slug>/<リポジトリ名> に作られる。空になった <slug> も片付ける
    try {
      fs.rmdirSync(path.dirname(worktreePath));
    } catch {
      // 他のリポジトリのワークツリーがあれば、残す
    }
  }

  async integrateBranch(_ctx: RequestContext, repoPath: string, base: string, branch: string): Promise<GitOutcome> {
    const notReady = await this.baseNotReady(repoPath, base);
    if (notReady) return { ok: false, reason: notReady };
    try {
      await this.git(repoPath, ['merge', '--no-edit', branch]);
    } catch (e) {
      await this.git(repoPath, ['merge', '--abort']).catch(() => undefined);
      return { ok: false, reason: `${base} へ ${branch} を取り込めなかった(コンフリクトなど): ${firstLine(e)}` };
    }
    await this.git(repoPath, ['branch', '-d', branch]).catch(() => undefined);
    return { ok: true };
  }

  async pullBase(_ctx: RequestContext, repoPath: string, base: string): Promise<GitOutcome> {
    const notReady = await this.baseNotReady(repoPath, base);
    if (notReady) return { ok: false, reason: notReady };
    try {
      await this.git(repoPath, ['pull', '--ff-only']);
    } catch (e) {
      return { ok: false, reason: `${base} を pull できなかった: ${firstLine(e)}` };
    }
    return { ok: true };
  }

  /** 元のリポジトリを、勝手に動かしてよい状態か。よくないなら、その理由 */
  private async baseNotReady(repoPath: string, base: string): Promise<string | null> {
    const current = await this.git(repoPath, ['rev-parse', '--abbrev-ref', 'HEAD']).catch(() => '');
    if (current !== base) return `${repoPath} は ${base} をチェックアウトしていない(今は ${current || '不明'})`;
    const dirty = await this.git(repoPath, ['status', '--porcelain', '--untracked-files=no']).catch(() => 'unknown');
    if (dirty !== '') return `${repoPath} に未コミットの変更がある`;
    return null;
  }

  /**
   * 元のリポジトリの `.worktreeinclude` に書かれた、gitignore 済みのファイル(.env など)を、新しいワークツリーへ写す。
   * 追跡されているファイルは対象外。ワークツリーに既にあるファイルは、上書きしない。
   */
  private async copyWorktreeIncludes(repoPath: string, worktreePath: string): Promise<void> {
    const includeFile = path.join(repoPath, WORKTREE_INCLUDE);
    if (!fs.existsSync(includeFile)) return;

    // 「未追跡で、gitignore されている」ものと、「未追跡で、.worktreeinclude に合う」ものの、両方に入るファイルだけ
    const ignored = new Set(await this.listUntracked(repoPath, ['--exclude-standard']));
    const included = await this.listUntracked(repoPath, [`--exclude-from=${includeFile}`]);
    for (const relative of included) {
      if (!ignored.has(relative)) continue;
      const source = path.join(repoPath, relative);
      const target = path.join(worktreePath, relative);
      if (fs.existsSync(target) || !fs.statSync(source).isFile()) continue;
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(source, target);
    }
  }

  private async listUntracked(repoPath: string, excludes: string[]): Promise<string[]> {
    const out = await this.git(repoPath, ['ls-files', '-z', '--others', '--ignored', ...excludes]);
    return out.split('\0').filter((p) => p !== '');
  }

  private async git(cwd: string, args: string[]): Promise<string> {
    const { stdout } = await run('git', args, { cwd, windowsHide: true, maxBuffer: 16 * 1024 * 1024 });
    return stdout.trim();
  }
}
