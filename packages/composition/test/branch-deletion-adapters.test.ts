import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Ticket } from '@anvil/entity';
import { GhCliPullRequests } from '@anvil/gh-cli';
import { GitCli } from '@anvil/git-cli';
import { NoopPullRequest, RecordingNotifier } from '@anvil/noop';
import { type BranchStore, CleanUpWorktrees, type GitPort, type PullRequestState, type RepoStore } from '@anvil/usecase';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { git, human } from './helpers';

let dir: string;
beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'anvil-branch-'));
});
afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

describe('GitCli(ブランチの先頭の取得と削除)', () => {
  let repo: string;
  beforeEach(() => {
    repo = path.join(dir, 'repo');
    const bare = path.join(dir, 'origin.git');
    fs.mkdirSync(repo);
    git(repo, 'init', '-b', 'main');
    fs.writeFileSync(path.join(repo, 'a.txt'), 'a');
    git(repo, 'add', '.');
    git(repo, 'commit', '-m', 'init');
    git(dir, 'init', '--bare', '-b', 'main', bare);
    git(repo, 'remote', 'add', 'origin', bare);
    git(repo, 'push', '-u', 'origin', 'main');
    git(repo, 'checkout', '-b', 'feat/x');
    fs.writeFileSync(path.join(repo, 'x.txt'), 'x');
    git(repo, 'add', '.');
    git(repo, 'commit', '-m', 'x');
    git(repo, 'push', 'origin', 'feat/x');
    git(repo, 'checkout', 'main');
  });

  it('getBranchHead: 完全な SHA を返す。ブランチが無ければ null', async () => {
    expect(await new GitCli().getBranchHead(human, repo, 'feat/x')).toBe(git(repo, 'rev-parse', 'feat/x'));
    expect(await new GitCli().getBranchHead(human, repo, 'feat/none')).toBeNull();
  });

  it('deleteLocalBranch: マージ済みでなくても(祖先でなくても)消える。無いブランチは例外', async () => {
    await new GitCli().deleteLocalBranch(human, repo, 'feat/x');

    expect(git(repo, 'branch', '--list', 'feat/x')).toBe('');
    await expect(new GitCli().deleteLocalBranch(human, repo, 'feat/x')).rejects.toThrow();
  });

  it('deleteRemoteBranch: origin にあれば消え、既に無ければ成功する(ロケールによらない)', async () => {
    const lang = process.env.LANG;
    process.env.LANG = 'ja_JP.UTF-8';
    try {
      await new GitCli().deleteRemoteBranch(human, repo, 'feat/x');
      expect(git(repo, 'ls-remote', '--heads', 'origin', 'feat/x')).toBe('');
      await new GitCli().deleteRemoteBranch(human, repo, 'feat/x');
    } finally {
      if (lang === undefined) delete process.env.LANG;
      else process.env.LANG = lang;
    }
  });

  it('deleteRemoteBranch: origin に届かなければ例外', async () => {
    git(repo, 'remote', 'set-url', 'origin', path.join(dir, 'missing.git'));

    await expect(new GitCli().deleteRemoteBranch(human, repo, 'feat/x')).rejects.toThrow();
  });
});

describe('GhCliPullRequests.getState(gh pr view の解釈)', () => {
  const FIXTURES = path.resolve(import.meta.dirname, 'fixtures');
  const url = 'https://github.com/o/r/pull/7';
  const prs = () => new GhCliPullRequests({ write: async () => '' }, { bin: process.execPath, args: [path.join(FIXTURES, 'fake-gh.mjs')] });
  let ghLog: string;
  beforeEach(() => {
    ghLog = path.join(dir, 'gh.log');
    process.env.FAKE_GH_LOG = ghLog;
  });
  afterEach(() => {
    delete process.env.FAKE_GH_LOG;
    delete process.env.FAKE_GH_VIEW_OUTPUT;
    delete process.env.FAKE_GH_VIEW_EXIT;
  });

  it('state と headRefOid を返し、pr view に URL と --json state,headRefOid を渡す', async () => {
    process.env.FAKE_GH_VIEW_OUTPUT = '{"state":"MERGED","headRefOid":"abc123"}';

    expect(await prs().getState(human, url)).toEqual({ state: 'MERGED', headRefOid: 'abc123' });
    expect(JSON.parse(fs.readFileSync(ghLog, 'utf8').trim())).toEqual(['pr', 'view', url, '--json', 'state,headRefOid']);
  });

  it('未知の state も、文字列のまま返す', async () => {
    process.env.FAKE_GH_VIEW_OUTPUT = '{"state":"DRAFT","headRefOid":"abc"}';

    expect((await prs().getState(human, url)).state).toBe('DRAFT');
  });

  it.each([
    ['不正な JSON', 'not json', '0'],
    ['必須フィールドの欠落', '{"state":"MERGED"}', '0'],
    ['非ゼロ終了', '{"state":"MERGED","headRefOid":"abc"}', '1'],
  ])('%s: 例外', async (_name, output, exit) => {
    process.env.FAKE_GH_VIEW_OUTPUT = output;
    process.env.FAKE_GH_VIEW_EXIT = exit;

    await expect(prs().getState(human, url)).rejects.toThrow();
  });
});

describe('NoopPullRequest.getState', () => {
  it('設定していない URL は例外', async () => {
    await expect(new NoopPullRequest().getState(human, 'x://y')).rejects.toThrow();
  });
});

/** 呼び出しを記録する偽の GitPort。失敗は、操作の名前ごとに差し込む */
class FakeGit implements GitPort {
  readonly calls: string[] = [];
  readonly failures = new Set<string>();
  head: string | null = 'aaa';

  private async step(name: string): Promise<void> {
    this.calls.push(name);
    if (this.failures.has(name)) throw new Error(`${name} failed`);
  }

  async branchExists() {
    return true;
  }
  async ensureBranchAndWorktree() {}
  async removeWorktree() {
    await this.step('removeWorktree');
  }
  async integrateBranch() {
    this.calls.push('integrateBranch');
    return { ok: true } as const;
  }
  async pullBase() {
    this.calls.push('pullBase');
    return this.failures.has('pullBase') ? ({ ok: false, reason: 'pull failed' } as const) : ({ ok: true } as const);
  }
  async getBranchHead() {
    this.calls.push('getBranchHead');
    return this.head;
  }
  async deleteLocalBranch() {
    await this.step('deleteLocalBranch');
  }
  async deleteRemoteBranch() {
    await this.step('deleteRemoteBranch');
  }
}

describe('CleanUpWorktrees(偽の GitPort で、順序と部分失敗を確かめる)', () => {
  const merged: PullRequestState = { state: 'MERGED', headRefOid: 'aaa' };
  const ticket = { id: 1, projectId: 1, prUrls: { app: 'u1', lib: 'u2' } } as unknown as Ticket;
  const branches = {
    list: async () => [
      { repoName: 'app', branch: 'feat/x', worktreePath: '/w/app' },
      { repoName: 'lib', branch: 'feat/x', worktreePath: '/w/lib' },
    ],
  } as unknown as BranchStore;
  const repos = {
    listByProject: async () => [
      { name: 'app', path: '/r/app', defaultBranch: 'main', hasRemote: true },
      { name: 'lib', path: '/r/lib', defaultBranch: 'main', hasRemote: true },
    ],
  } as unknown as RepoStore;

  function build() {
    const fakeGit = new FakeGit();
    const pullRequests = new NoopPullRequest();
    const notifier = new RecordingNotifier();
    const useCase = new CleanUpWorktrees(branches, repos, fakeGit, pullRequests, notifier);
    return { fakeGit, pullRequests, notifier, run: () => useCase.execute(human, { ticket }) };
  }

  it('順序: ワークツリー削除 → pull → 先頭の取得 → ローカル削除 → リモート削除', async () => {
    const { fakeGit, pullRequests, run } = build();
    pullRequests.states.set('u1', merged);
    pullRequests.states.set('u2', { state: 'OPEN', headRefOid: 'aaa' });

    await run();

    expect(fakeGit.calls.slice(0, 5)).toEqual(['removeWorktree', 'pullBase', 'getBranchHead', 'deleteLocalBranch', 'deleteRemoteBranch']);
  });

  it('pull に失敗: PR の状態も取らず、削除もしない', async () => {
    const { fakeGit, pullRequests, notifier, run } = build();
    fakeGit.failures.add('pullBase');
    pullRequests.states.set('u1', merged);

    await run();

    expect(pullRequests.stateRequests).toEqual([]);
    expect(fakeGit.calls).not.toContain('deleteLocalBranch');
    expect(notifier.notifications.map((n) => n.body).join()).toContain('pull failed');
  });

  it('ローカルの削除に失敗しても、リモートは削除し、知らせる。もう一方のリポジトリも処理する', async () => {
    const { fakeGit, pullRequests, notifier, run } = build();
    fakeGit.failures.add('deleteLocalBranch');
    pullRequests.states.set('u1', merged);
    pullRequests.states.set('u2', merged);

    await run();

    expect(fakeGit.calls.filter((c) => c === 'deleteRemoteBranch')).toHaveLength(2);
    expect(notifier.notifications[0]?.body).toContain('ローカルの削除に失敗');
    expect(notifier.notifications[0]?.body).toContain('feat/x');
  });

  it('リモートの削除に失敗: ローカルは削除済みで、知らせる', async () => {
    const { fakeGit, pullRequests, notifier, run } = build();
    fakeGit.failures.add('deleteRemoteBranch');
    pullRequests.states.set('u1', merged);
    pullRequests.states.set('u2', { state: 'CLOSED', headRefOid: 'aaa' });

    await run();

    expect(fakeGit.calls).toContain('deleteLocalBranch');
    expect(notifier.notifications[0]?.body).toContain('リモートの削除に失敗');
    expect(notifier.notifications[1]?.body).toContain('CLOSED');
  });

  it('ローカルのブランチが無い: 削除せず、知らせる', async () => {
    const { fakeGit, pullRequests, notifier, run } = build();
    fakeGit.head = null;
    pullRequests.states.set('u1', merged);
    pullRequests.states.set('u2', merged);

    await run();

    expect(fakeGit.calls).not.toContain('deleteLocalBranch');
    expect(fakeGit.calls).not.toContain('deleteRemoteBranch');
    expect(notifier.notifications[0]?.body).toContain('先頭コミット');
  });
});
