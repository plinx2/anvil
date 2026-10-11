import fs from 'node:fs';
import path from 'node:path';
import { Role } from '@anvil/entity';
import { describe, expect, it } from 'vitest';
import { asRole, branchExists, git, human, setup } from './helpers';

type Env = Awaited<ReturnType<typeof setup>>;

/** 設計前ゲートからブランチを切り、ワークツリーでファイルをコミットして、完了前ゲートまで進める。ワークツリーの場所を返す */
async function workUntilDoneGate(env: Env, slug: string, file: string, content: string) {
  const { s, project } = env;
  const { ticket: t } = await s.tickets.create(human, {
    projectId: project.id,
    title: slug,
    slug,
    state: 'pre_design_gate',
    designNeeded: false,
    targetRepos: ['app'],
  });
  await s.flow.passDesignGate(human, { ticketId: t.id, sp: 1 });
  const worktree = (await s.tickets.detail(human, { ticketId: t.id })).detail.branches[0]?.worktreePath ?? '';
  fs.writeFileSync(path.join(worktree, file), content);
  git(worktree, 'add', '.');
  git(worktree, 'commit', '-m', `add ${file}`);
  for (const role of [Role.FUNC_DESIGNER, Role.QA]) await s.flow.advance(asRole(role), { ticketId: t.id });
  await s.flow.passImplGate(human, { ticketId: t.id });
  for (const role of [Role.CODER, Role.FUNC_VERIFIER, Role.REVIEWER]) await s.flow.advance(asRole(role), { ticketId: t.id });
  await env.idle();
  return { ticketId: t.id, worktree };
}

describe('完了時の、元のリポジトリへの反映', () => {
  it('リモートが無い: ワークツリーを消し、ベースブランチへ取り込んで、作業ブランチを削除する', async () => {
    const env = await setup({ remote: false });
    const { ticketId, worktree } = await workUntilDoneGate(env, 'feat/x', 'x.txt', 'x');

    await env.s.flow.passDoneGate(human, { ticketId });

    expect(fs.existsSync(worktree)).toBe(false);
    expect(fs.existsSync(path.dirname(worktree))).toBe(false); // 空のディレクトリも残らない
    expect(fs.readFileSync(path.join(env.repo, 'x.txt'), 'utf8')).toBe('x');
    expect(branchExists(env.repo, 'feat/x')).toBe(false);
    expect(env.notifier.notifications).toEqual([]);
  });

  it('git が消しきれないワークツリー(node_modules などの残骸)も、ディレクトリごと消す', async () => {
    const env = await setup({ remote: false });
    const { ticketId, worktree } = await workUntilDoneGate(env, 'feat/y', 'y.txt', 'y');
    fs.mkdirSync(path.join(worktree, 'node_modules', '.pnpm'), { recursive: true });
    fs.writeFileSync(path.join(worktree, 'node_modules', '.pnpm', 'big.js'), 'x');
    fs.rmSync(path.join(worktree, '.git'), { force: true }); // git からは、ワークツリーとして扱えない状態にする

    await env.s.flow.passDoneGate(human, { ticketId });

    expect(fs.existsSync(worktree)).toBe(false);
    expect(fs.existsSync(path.dirname(worktree))).toBe(false);
    expect(git(env.repo, 'worktree', 'list', '--porcelain')).not.toContain(path.basename(path.dirname(worktree)));
    expect(branchExists(env.repo, 'feat/y')).toBe(false); // 取り込みも、できている
    expect(env.notifier.notifications).toEqual([]);
  });

  it('リモートが無い: コンフリクトしたら、取り込みを中止し、ブランチを残して、人間に知らせる', async () => {
    const env = await setup({ remote: false });
    const { ticketId } = await workUntilDoneGate(env, 'feat/c', 'a.txt', 'branch side');
    fs.writeFileSync(path.join(env.repo, 'a.txt'), 'main side');
    git(env.repo, 'commit', '-am', 'main change');

    await env.s.flow.passDoneGate(human, { ticketId });

    expect(branchExists(env.repo, 'feat/c')).toBe(true);
    expect(fs.readFileSync(path.join(env.repo, 'a.txt'), 'utf8')).toBe('main side'); // 元のまま
    expect(git(env.repo, 'status', '--porcelain')).toBe(''); // マージの途中で残らない
    expect(env.notifier.notifications.at(-1)?.body).toContain('feat/c');
  });

  it('リモートが無い: 元のリポジトリに未コミットの変更があれば、何もせず、ブランチを残して知らせる', async () => {
    const env = await setup({ remote: false });
    const { ticketId } = await workUntilDoneGate(env, 'feat/d', 'd.txt', 'd');
    fs.writeFileSync(path.join(env.repo, 'a.txt'), 'uncommitted');

    await env.s.flow.passDoneGate(human, { ticketId });

    expect(branchExists(env.repo, 'feat/d')).toBe(true);
    expect(fs.existsSync(path.join(env.repo, 'd.txt'))).toBe(false);
    expect(fs.readFileSync(path.join(env.repo, 'a.txt'), 'utf8')).toBe('uncommitted'); // 変更は消えない
    expect(env.notifier.notifications.at(-1)?.body).toContain('未コミット');
  });

  it('リモートがある: PR でマージされた分を、ベースブランチへ pull する(作業ブランチは消さない)', async () => {
    const env = await setup({ remote: true });
    const bare = path.join(env.dir, 'origin.git');
    git(env.dir, 'init', '--bare', '-b', 'main', bare);
    git(env.repo, 'remote', 'add', 'origin', bare);
    git(env.repo, 'push', '-u', 'origin', 'main');
    const { ticketId } = await workUntilDoneGate(env, 'feat/r', 'r.txt', 'r');

    // PR がマージされた、という状態を、別のクローンからの push で作る
    const other = path.join(env.dir, 'other');
    git(env.dir, 'clone', bare, other);
    fs.writeFileSync(path.join(other, 'merged.txt'), 'merged');
    git(other, 'add', '.');
    git(other, 'commit', '-m', 'merged PR');
    git(other, 'push', 'origin', 'main');

    await env.s.flow.passDoneGate(human, { ticketId });

    expect(fs.readFileSync(path.join(env.repo, 'merged.txt'), 'utf8')).toBe('merged');
    expect(branchExists(env.repo, 'feat/r')).toBe(true);
    expect(env.notifier.notifications).toEqual([]);
  });
});
