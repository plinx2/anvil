import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Actor, Role } from '@anvil/entity';
import { newRequestContext, type RequestContext } from '@anvil/usecase';
import { createAnvil } from '../src';

const env = { ...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' };
export const git = (cwd: string, ...args: string[]) => execFileSync('git', args, { cwd, env }).toString().trim();

/** 人間の文脈 */
export const human: RequestContext = newRequestContext(Actor.human());
/** anvil の自動の文脈 */
export const auto: RequestContext = newRequestContext(Actor.auto());
/** ロールのエージェントの文脈 */
export const asRole = (role: Role): RequestContext => newRequestContext(Actor.ofRole(role));

export function branchExists(repo: string, branch: string): boolean {
  try {
    git(repo, 'rev-parse', '--verify', '--quiet', `refs/heads/${branch}`);
    return true;
  } catch {
    return false;
  }
}

/** 一時的な git リポジトリと、メモリ上の DB で、anvil 全体(エージェントと PR は何もしない実装)を組み立てる。 */
export async function setup(options: { remote?: boolean } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'anvil-test-'));
  const repo = path.join(dir, 'repo');
  fs.mkdirSync(repo);
  git(repo, 'init', '-b', 'main');
  fs.writeFileSync(path.join(repo, 'a.txt'), 'a');
  git(repo, 'add', '.');
  git(repo, 'commit', '-m', 'init');

  const anvil = createAnvil({
    home: path.join(dir, 'home'),
    dbFile: ':memory:',
    agentsDir: path.resolve(import.meta.dirname, '..', '..', '..', 'agents'), // 実物のロール定義(本文をプロンプトに埋め込むので、読める必要がある)
    mcpUrl: 'http://127.0.0.1:0/mcp',
    agent: 'noop',
    herdrSession: 'anvil',
    pullRequests: 'noop',
    models: { standard: 'standard-model', light: 'light-model' },
  });
  const s = anvil.service;
  const { project } = await s.projects.create(human, { name: 'demo' });
  await s.projects.addRepo(human, { projectId: project.id, name: 'app', path: repo, hasRemote: options.remote ?? true });

  const fakes = anvil.fakes;
  return {
    anvil,
    s,
    project,
    repo,
    dir,
    agents: fakes.agents!,
    pullRequests: fakes.pullRequests!,
    notifier: fakes.notifier!,
    idle: () => anvil.tasks.idle(),
  };
}

export type Env = Awaited<ReturnType<typeof setup>>;

/** 設計前ゲートからブランチを切り、ワークツリーでファイルをコミットして、完了前ゲートまで進める。ワークツリーの場所を返す */
export async function workUntilDoneGate(env: Env, slug: string, file: string, content: string) {
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
