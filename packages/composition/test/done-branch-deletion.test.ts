import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { branchExists, type Env, git, human, setup, workUntilDoneGate } from './helpers';

/** origin(ローカルの bare)を用意して、ベースブランチを push する */
function addOrigin(env: Env): string {
  const bare = path.join(env.dir, 'origin.git');
  git(env.dir, 'init', '--bare', '-b', 'main', bare);
  git(env.repo, 'remote', 'add', 'origin', bare);
  git(env.repo, 'push', '-u', 'origin', 'main');
  return bare;
}

/** 作業ブランチを origin へ push し、別のクローンから squash マージして、ベースへ push する(作業ブランチはベースの祖先にならない) */
function squashMergeOnOrigin(env: Env, bare: string, branch: string): void {
  git(env.repo, 'push', 'origin', branch);
  const other = path.join(env.dir, 'other');
  git(env.dir, 'clone', bare, other);
  git(other, 'fetch', 'origin', branch);
  git(other, 'merge', '--squash', `origin/${branch}`);
  git(other, 'commit', '-m', `squash ${branch}`);
  git(other, 'push', 'origin', 'main');
}

/** 偽の PR 作成が記録する URL */
const prUrlOf = (branch: string) => `dry-run://app/${branch}`;

const remoteHasBranch = (repo: string, branch: string) => git(repo, 'ls-remote', '--heads', 'origin', branch) !== '';

/** リモートありで完了前ゲートまで進め、作業ブランチを squash マージ済みの状態にする */
async function prepare(branch: string, options: { prCreationFails?: boolean } = {}) {
  const env = await setup({ remote: true });
  const bare = addOrigin(env);
  if (options.prCreationFails) env.pullRequests.failWith = 'PR を作れない'; // 完了前ゲートで PR の URL が記録されない
  const { ticketId, worktree } = await workUntilDoneGate(env, branch, 'w.txt', 'w');
  const head = git(worktree, 'rev-parse', 'HEAD');
  squashMergeOnOrigin(env, bare, branch);
  return { env, ticketId, worktree, head };
}

type Prepared = Awaited<ReturnType<typeof prepare>>;

describe('完了時の、マージ済みの作業ブランチの削除(リモートあり)', () => {
  it('MERGED で先頭コミットが一致: squash マージで祖先でなくても、ローカルと origin のブランチを削除する', async () => {
    const { env, ticketId, worktree, head } = await prepare('feat/m');
    env.pullRequests.states.set(prUrlOf('feat/m'), { state: 'MERGED', headRefOid: head });
    git(env.repo, 'pull', '--ff-only');
    expect(git(env.repo, 'branch', '--merged', 'main')).not.toContain('feat/m'); // `git branch -d` では消せない状況

    await env.s.flow.passDoneGate(human, { ticketId });

    expect(fs.existsSync(worktree)).toBe(false);
    expect(branchExists(env.repo, 'feat/m')).toBe(false);
    expect(remoteHasBranch(env.repo, 'feat/m')).toBe(false);
    expect(env.notifier.notifications).toEqual([]);
  });

  it('headRefOid が大文字でも、一致として扱う', async () => {
    const { env, ticketId, head } = await prepare('feat/u');
    env.pullRequests.states.set(prUrlOf('feat/u'), { state: 'MERGED', headRefOid: head.toUpperCase() });

    await env.s.flow.passDoneGate(human, { ticketId });

    expect(branchExists(env.repo, 'feat/u')).toBe(false);
  });

  it('origin に同名のブランチが既に無い(自動削除済み): エラーにせず、ローカルだけ削除する', async () => {
    const { env, ticketId, head } = await prepare('feat/a');
    env.pullRequests.states.set(prUrlOf('feat/a'), { state: 'MERGED', headRefOid: head });
    git(env.repo, 'push', 'origin', '--delete', 'feat/a');

    await env.s.flow.passDoneGate(human, { ticketId });

    expect(branchExists(env.repo, 'feat/a')).toBe(false);
    expect(env.notifier.notifications).toEqual([]);
  });

  const keepCases: Array<{ name: string; branch: string; reason: string; arrange: (p: Prepared) => void }> = [
    {
      name: 'OPEN',
      branch: 'feat/o',
      reason: 'OPEN',
      arrange: (p) => p.env.pullRequests.states.set(prUrlOf('feat/o'), { state: 'OPEN', headRefOid: p.head }),
    },
    {
      name: 'CLOSED',
      branch: 'feat/cl',
      reason: 'CLOSED',
      arrange: (p) => p.env.pullRequests.states.set(prUrlOf('feat/cl'), { state: 'CLOSED', headRefOid: p.head }),
    },
    {
      name: '未知の state',
      branch: 'feat/k',
      reason: 'DRAFT',
      arrange: (p) => p.env.pullRequests.states.set(prUrlOf('feat/k'), { state: 'DRAFT', headRefOid: p.head }),
    },
    {
      name: 'gh の失敗',
      branch: 'feat/f',
      reason: 'gh で PR の状態を取れなかった',
      arrange: (p) => p.env.pullRequests.states.set(prUrlOf('feat/f'), new Error('gh: auth')),
    },
    {
      name: 'マージ後にコミットが追加された(先頭が不一致)',
      branch: 'feat/p',
      reason: 'マージ後にコミットが追加',
      arrange: (p) => {
        p.env.pullRequests.states.set(prUrlOf('feat/p'), { state: 'MERGED', headRefOid: p.head });
        fs.writeFileSync(path.join(p.worktree, 'more.txt'), 'more');
        git(p.worktree, 'add', '.');
        git(p.worktree, 'commit', '-m', 'after merge');
      },
    },
    {
      name: 'headRefOid が空',
      branch: 'feat/z',
      reason: 'マージ後にコミットが追加',
      arrange: (p) => p.env.pullRequests.states.set(prUrlOf('feat/z'), { state: 'MERGED', headRefOid: '' }),
    },
  ];

  for (const c of keepCases) {
    it(`${c.name}: 何も削除せず、理由とブランチ名を知らせる(完了は成功する)`, async () => {
      const prepared = await prepare(c.branch);
      c.arrange(prepared);
      const { env, ticketId } = prepared;

      await env.s.flow.passDoneGate(human, { ticketId });

      expect((await env.s.tickets.detail(human, { ticketId })).detail.ticket.state).toBe('done');
      expect(branchExists(env.repo, c.branch)).toBe(true);
      expect(remoteHasBranch(env.repo, c.branch)).toBe(true);
      const body = env.notifier.notifications.at(-1)?.body ?? '';
      expect(body).toContain(c.reason);
      expect(body).toContain(c.branch);
    });
  }

  it('チケットに PR の URL が無い: gh を呼ばず、削除せず、知らせる', async () => {
    const { env, ticketId } = await prepare('feat/n', { prCreationFails: true });

    await env.s.flow.passDoneGate(human, { ticketId });

    expect(env.pullRequests.stateRequests).toEqual([]);
    expect(branchExists(env.repo, 'feat/n')).toBe(true);
    const body = env.notifier.notifications.at(-1)?.body ?? '';
    expect(body).toContain('PR の URL が無い');
    expect(body).toContain('feat/n');
  });

  it('リモートが無い: PR の状態を取りにいかず、従来どおり取り込んで削除する', async () => {
    const env = await setup({ remote: false });
    const { ticketId } = await workUntilDoneGate(env, 'feat/l', 'l.txt', 'l');

    await env.s.flow.passDoneGate(human, { ticketId });

    expect(env.pullRequests.stateRequests).toEqual([]);
    expect(branchExists(env.repo, 'feat/l')).toBe(false);
  });
});
