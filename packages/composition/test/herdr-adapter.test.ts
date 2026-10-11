import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Role } from '@anvil/entity';
import { HerdrClaudeCli, HerdrCli } from '@anvil/herdr-claude-cli';
import type { AgentLaunch } from '@anvil/usecase';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { human } from './helpers';

const FAKE_HERDR = path.resolve(import.meta.dirname, 'fixtures', 'fake-herdr.mjs');
const MODELS = { standard: 'standard-model', light: 'light-model' };

interface FakeState {
  sessions: Record<
    string,
    {
      running: boolean;
      workspaces?: Array<{ label: string }>;
      panes?: Array<{ pane_id: string; label: string; cwd: string }>;
      agents?: Array<any>;
    }
  >;
  calls: Array<{ session: string; args: string[] }>;
}

describe('herdr アダプタ(偽の herdr で、実機で確かめた契約を再現する)', () => {
  let dir: string;
  let stateFile: string;
  const saved = { state: process.env.FAKE_HERDR_STATE, block: process.env.FAKE_HERDR_BLOCK, claude: process.env.CLAUDE_CONFIG_DIR };
  const state = (): FakeState => JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  const herdr = (session = 'anvil') => new HerdrCli(session, process.execPath, [FAKE_HERDR]);
  const launchOf = (overrides: Partial<AgentLaunch> = {}): AgentLaunch => ({
    name: 'anvil_t1_ac_refiner',
    project: 'demo',
    label: 'T-1',
    role: Role.AC_REFINER,
    modelTier: Role.AC_REFINER.modelTier,
    cwd: path.join(dir, 'work'),
    prompt: '最初のプロンプト\n2 行目',
    addDirs: [path.join(dir, 'context')],
    session: { id: 'session-1', resume: false },
    mcpConfigPath: path.join(dir, 'mcp.json'),
    ...overrides,
  });

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'anvil-herdr-'));
    stateFile = path.join(dir, 'state.json');
    process.env.FAKE_HERDR_STATE = stateFile;
    delete process.env.FAKE_HERDR_BLOCK;
    process.env.CLAUDE_CONFIG_DIR = path.join(dir, 'claude');
  });
  afterEach(() => {
    for (const [key, value] of [
      ['FAKE_HERDR_STATE', saved.state],
      ['FAKE_HERDR_BLOCK', saved.block],
      ['CLAUDE_CONFIG_DIR', saved.claude],
    ] as const) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('専用セッションのサーバーが無ければ、切り離して起動し、コマンドをやり直す', async () => {
    const result = await herdr('anvil').call(['workspace', 'list']);

    expect(result.result.workspaces).toEqual([]);
    expect(state().sessions.anvil?.running).toBe(true);
    const calls = state().calls.map((c) => `${c.session}: ${c.args.join(' ')}`);
    expect(calls).toEqual(['anvil: workspace list', 'anvil: server', 'anvil: workspace list', 'anvil: workspace list']);
  });

  it("'default' は herdr の既定のセッション: --session を付けない", async () => {
    await herdr('default').call(['workspace', 'list']);

    expect(state().calls).toEqual([{ session: 'default', args: ['workspace', 'list'] }]);
  });

  it('起動: プロジェクトごとのワークスペース(使い回す)、チケットごとのタブ、引数、プロンプトの送り込み', async () => {
    const runtime = new HerdrClaudeCli(MODELS, herdr());
    await runtime.launch(human, launchOf());
    await runtime.launch(human, launchOf({ name: 'anvil_t2_ac_refiner', label: 'T-2', session: { id: 'session-2', resume: true } }));

    const s = state().sessions.anvil;
    expect(s?.workspaces?.map((w) => w.label)).toEqual(['demo']); // 2 回目は使い回す
    expect(s?.panes?.map((p) => p.label)).toEqual(['T-1', 'T-2']);
    const [first, second] = s?.agents ?? [];
    expect(first.args).toEqual([
      '--session-id',
      'session-1',
      '--model',
      'standard-model',
      '--mcp-config',
      path.join(dir, 'mcp.json'),
      '--add-dir',
      path.join(dir, 'context'),
    ]); // prettier-ignore
    expect(second.args.slice(0, 2)).toEqual(['--resume', 'session-2']);
    expect(first.prompts).toEqual(['最初のプロンプト\n2 行目']);
    expect(await runtime.isRunning(human, 'anvil_t1_ac_refiner')).toBe(true);
    expect(await runtime.isRunning(human, 'anvil_t9_nobody')).toBe(false);
  });

  it('herdr が受け付けない名前は、起動の失敗になり、ペインが残らない', async () => {
    const runtime = new HerdrClaudeCli(MODELS, herdr());

    await expect(runtime.launch(human, launchOf({ name: 'anvil:t1:ac_refiner' }))).rejects.toThrow(/invalid_agent_name/);

    expect(state().sessions.anvil?.panes).toEqual([]);
  });

  it('起動中にブロックされたら(agent_not_ready)、ペインを閉じる。残すと名前が塞がって、再試行も失敗し続ける', async () => {
    const runtime = new HerdrClaudeCli(MODELS, herdr());
    process.env.FAKE_HERDR_BLOCK = '1';

    await expect(runtime.launch(human, launchOf())).rejects.toThrow(/agent_not_ready/);
    expect(state().sessions.anvil?.panes).toEqual([]);
    expect(state().sessions.anvil?.agents).toEqual([]);

    delete process.env.FAKE_HERDR_BLOCK;
    await runtime.launch(human, launchOf()); // 同じ名前で、やり直せる
    expect(state().sessions.anvil?.agents?.map((a) => a.name)).toEqual(['anvil_t1_ac_refiner']);
  });

  it('停止: ペインを閉じる', async () => {
    const runtime = new HerdrClaudeCli(MODELS, herdr());
    await runtime.launch(human, launchOf());

    await runtime.stop(human, 'anvil_t1_ac_refiner');

    expect(await runtime.isRunning(human, 'anvil_t1_ac_refiner')).toBe(false);
  });

  it('起動の前に、データ領域の配下の作業ディレクトリだけを、Claude Code で信頼済みにする', async () => {
    const home = path.join(dir, 'home');
    const runtime = new HerdrClaudeCli(MODELS, herdr(), home);
    const worktree = path.join(home, 'demo', 'worktrees', 't1');
    const userRepo = path.join(dir, 'user-repo');
    fs.mkdirSync(process.env.CLAUDE_CONFIG_DIR ?? '', { recursive: true });
    const configFile = path.join(process.env.CLAUDE_CONFIG_DIR ?? '', '.claude.json');
    fs.writeFileSync(configFile, JSON.stringify({ projects: {} }));

    await runtime.launch(human, launchOf({ cwd: worktree }));
    await runtime.launch(human, launchOf({ name: 'anvil_t2_ac_refiner', cwd: userRepo }));

    const trusted = Object.keys(JSON.parse(fs.readFileSync(configFile, 'utf8')).projects);
    expect(trusted).toEqual([path.resolve(worktree).replace(/\\/g, '/')]);
  });
});
