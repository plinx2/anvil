import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ClaudeCliPullRequestBodyWriter, ClaudeMcpConfigWriter } from '@anvil/claude-cli';
import { Role } from '@anvil/entity';
import { GhCliPullRequests } from '@anvil/gh-cli';
import type { PullRequestRequest } from '@anvil/usecase';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { git, human } from './helpers';

const FIXTURES = path.resolve(import.meta.dirname, 'fixtures');
const MODELS = { standard: 'standard-model', light: 'light-model' };

let dir: string;
beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'anvil-adapters-'));
});
afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

describe('ClaudeMcpConfigWriter(エージェントに渡す MCP の設定)', () => {
  const read = (file: string) => JSON.parse(fs.readFileSync(file, 'utf8')).mcpServers.anvil;

  it('チケットとロールをヘッダーに結びつけ、HTTP の MCP の形で書く', async () => {
    const writer = new ClaudeMcpConfigWriter(dir, 'http://127.0.0.1:4731/mcp');

    const file = await writer.write(human, { fileName: 't7-coder.json', ticketId: 7, role: Role.CODER });

    expect(file).toBe(path.join(dir, 'mcp', 't7-coder.json'));
    expect(read(file)).toEqual({
      type: 'http',
      url: 'http://127.0.0.1:4731/mcp',
      headers: { 'x-anvil-role': 'coder', 'x-anvil-ticket': '7' },
    });
  });

  it('起票担当は、起票の依頼とプロジェクトに結びつく(チケットには結びつかない)', async () => {
    const writer = new ClaudeMcpConfigWriter(dir, 'http://x/mcp');

    const file = await writer.write(human, { fileName: 'intake3-0.json', role: Role.PBI_AUTHOR, intakeItemId: 5, projectId: 2 });

    expect(read(file).headers).toEqual({ 'x-anvil-role': 'pbi_author', 'x-anvil-intake-item': '5', 'x-anvil-project': '2' });
  });

  it('プレフィックスで消す: t1- は t10- を巻き込まない', async () => {
    const writer = new ClaudeMcpConfigWriter(dir, 'http://x/mcp');
    for (const fileName of ['t1-coder.json', 't1-qa.json', 't10-coder.json'])
      await writer.write(human, { fileName, ticketId: 1, role: Role.CODER });

    await writer.removeByPrefix(human, 't1-');

    expect(fs.readdirSync(path.join(dir, 'mcp'))).toEqual(['t10-coder.json']);
  });

  it('ディレクトリが無くても、消す操作は失敗しない', async () => {
    await expect(new ClaudeMcpConfigWriter(dir, 'http://x/mcp').removeByPrefix(human, 't1-')).resolves.toBeUndefined();
  });
});

describe('ClaudeCliPullRequestBodyWriter(PR 本文を claude -p で作る)', () => {
  it('軽いモデルで、材料を渡し、チケットへのリンクを入れない指示をつけて、出力を整えて返す', async () => {
    const writer = new ClaudeCliPullRequestBodyWriter(MODELS, process.execPath, [path.join(FIXTURES, 'fake-claude.mjs')]);

    const body = await writer.write(human, '材料: ログイン画面');

    expect(body).toMatch(/^model=light-model/); // 前後の空白は取り除かれる
    expect(body).toContain('材料: ログイン画面');
    expect(body).toContain('anvil のチケットへのリンクは入れない');
  });
});

describe('GhCliPullRequests(git push と gh で PR を作る・更新する)', () => {
  let repo: string;
  let ghLog: string;
  const request = (overrides: Partial<PullRequestRequest> = {}): PullRequestRequest => ({
    repoPath: repo,
    repoName: 'app',
    base: 'main',
    branch: 'feat/x',
    title: 'ログイン画面',
    material: '材料',
    ...overrides,
  });
  const ghCalls = () =>
    fs
      .readFileSync(ghLog, 'utf8')
      .trim()
      .split('\n')
      .map((l) => JSON.parse(l) as string[]);
  const pullRequests = () =>
    new GhCliPullRequests(new ClaudeCliPullRequestBodyWriter(MODELS, process.execPath, [path.join(FIXTURES, 'fake-claude.mjs')]), {
      bin: process.execPath,
      args: [path.join(FIXTURES, 'fake-gh.mjs')],
    });

  beforeEach(() => {
    repo = path.join(dir, 'repo');
    fs.mkdirSync(repo);
    git(repo, 'init', '-b', 'main');
    fs.writeFileSync(path.join(repo, 'a.txt'), 'a');
    git(repo, 'add', '.');
    git(repo, 'commit', '-m', 'init');
    git(repo, 'checkout', '-b', 'feat/x');
    const bare = path.join(dir, 'origin.git');
    execFileSync('git', ['init', '--bare', '-b', 'main', bare]);
    git(repo, 'remote', 'add', 'origin', bare);
    ghLog = path.join(dir, 'gh.log');
    process.env.FAKE_GH_LOG = ghLog;
  });
  afterEach(() => {
    delete process.env.FAKE_GH_LOG;
  });

  it('新規: ブランチを push し、gh pr create に base・head・タイトル・本文を渡して、URL を返す', async () => {
    const url = await pullRequests().createOrUpdate(human, request());

    expect(url).toBe('https://github.com/o/r/pull/7');
    expect(git(path.join(dir, 'origin.git'), 'branch', '--list', 'feat/x')).toContain('feat/x');
    const [call] = ghCalls();
    expect(call?.slice(0, 2)).toEqual(['pr', 'create']);
    expect(call).toEqual(expect.arrayContaining(['--base', 'main', '--head', 'feat/x', '--title', 'ログイン画面']));
    expect(call?.[call.indexOf('--body') + 1]).toContain('材料'); // 本文は、背景ロールが作ったもの
  });

  it('更新: 既存の PR は、gh pr edit で更新し、同じ URL を返す(作り直さない)', async () => {
    const existing = 'https://github.com/o/r/pull/3';

    const url = await pullRequests().createOrUpdate(human, request({ existingUrl: existing }));

    expect(url).toBe(existing);
    expect(ghCalls().map((c) => c.slice(0, 3))).toEqual([['pr', 'edit', existing]]);
  });

  it('push に失敗したら(origin が無い)、PR は作らず、失敗する', async () => {
    git(repo, 'remote', 'remove', 'origin');

    await expect(pullRequests().createOrUpdate(human, request())).rejects.toThrow();
    expect(fs.existsSync(ghLog)).toBe(false);
  });
});
