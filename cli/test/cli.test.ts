import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createAnvil } from '@anvil/composition';
import { Actor } from '@anvil/entity';
import { newRequestContext, OPERATIONS } from '@anvil/service';
import { renderUsage, runCommand } from 'citty';
import { describe, expect, it } from 'vitest';
import type { CliDeps } from '../src/cli-deps';
import { commandNames } from '../src/command-names';
import { rootCommand } from '../src/root-command';

function setup() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'anvil-cli-'));
  const anvil = createAnvil({
    home: path.join(dir, 'home'),
    dbFile: ':memory:',
    agentsDir: path.resolve(import.meta.dirname, '..', '..', 'agents'), // 実物のロール定義(本文をプロンプトに埋め込むので、読める必要がある)
    mcpUrl: 'http://127.0.0.1:0/mcp',
    agent: 'noop',
    herdrSession: 'anvil',
    pullRequests: 'noop',
    models: { standard: 'standard-model', light: 'light-model' },
  });
  let output = '';
  const deps: CliDeps = {
    service: anvil.service,
    ctx: newRequestContext(Actor.human()),
    print: (text) => {
      output = text;
    },
    fail: (e) => {
      throw e;
    },
  };
  const root = rootCommand(deps);
  const run = async (...argv: string[]) => {
    output = '';
    await runCommand(root, { rawArgs: argv });
    return output;
  };
  return { anvil, dir, root, run };
}

describe('anvil コマンド(citty。サーバーを使わず、直接実行する)', () => {
  it('プロジェクトを作り、起票して、進められる(HTTP API と同じユースケース)', async () => {
    const { anvil, dir, run } = setup();
    expect(await run('project', 'create', 'demo')).toMatch(/登録した: 1 demo/);
    expect(await run('repo', 'add', '1', 'app', dir)).toMatch(/app/);
    expect(await run('ticket', 'create', '--project', '1', '--title', 'ログイン', '--body', 'AC: …')).toMatch(/T-1/);
    expect(await run('ticket', 'start', '1')).toMatch(/リファイン/);
    await anvil.tasks.idle();

    expect(await run('board')).toMatch(/T-1\tリファイン\tログイン\tdemo/);
    expect(await run('ticket', 'show', '1')).toMatch(/状態: リファイン/);
    expect(await run('project', 'list')).toMatch(/demo/);
  });

  it('すべての操作を、コマンドとして提供する(operations.ts の対応表のとおり)', () => {
    const { root } = setup();
    const expected = OPERATIONS.flatMap((o) => (o.cli ? [o.cli] : []));
    // serve は、操作ではなく、サーバーの起動(operations.ts の対応表に無い)
    expect(
      commandNames(root)
        .filter((n) => n !== 'serve')
        .sort(),
    ).toEqual([...expected].sort());
    expect(commandNames(root)).toContain('serve');
  });

  it('知らないコマンド、足りない引数は、実行せずに失敗する。使い方は、コマンドの定義から出る', async () => {
    const { root, run } = setup();
    await expect(run('unknown')).rejects.toThrow(/Unknown command/);
    await expect(run('ticket', 'show')).rejects.toThrow(/Missing required positional argument: TICKETID/);
    await expect(run('ticket', 'create', '--title', 'x')).rejects.toThrow(/Missing required argument: --project/);
    expect(await renderUsage(root)).toMatch(/ticket/);
  });

  it('整数でない番号、選択肢にない値は、サービスに届く前に拒否する', async () => {
    const { run } = setup();
    await expect(run('ticket', 'show', 'abc')).rejects.toMatchObject({ code: 'invalid' });
    await expect(run('ticket', 'create', '--project', '1', '--title', 'x', '--kind', 'bogus')).rejects.toThrow(/Invalid value/);
    expect(await run('project', 'list')).toMatch(/プロジェクトが無い/);
  });

  it('--json で、結果を JSON で返す。承認待ちフラグも、コマンドで操作できる', async () => {
    const { anvil, dir, run } = setup();
    expect(JSON.parse(await run('project', 'create', 'demo', '--json')).project.name).toBe('demo');
    await run('repo', 'add', '1', 'app', dir);
    await run('ticket', 'create', '--project', '1', '--title', 'x', '--state', 'refine');
    await anvil.tasks.idle();
    expect(JSON.parse(await run('ticket', 'ask', '1', 'どちらですか', '--json')).ticket.awaiting).toBe(true);
    expect(JSON.parse(await run('ticket', 'answer', '1', 'A', '--json')).ticket.awaiting).toBe(false);
    expect(JSON.parse(await run('dashboard', '--json'))).toBeDefined();
  });

  it('カンマ区切りの複数指定(--repo、--depends-on)と、true / false のオプションが使える', async () => {
    const { anvil, dir, run } = setup();
    await run('project', 'create', 'demo');
    await run('repo', 'add', '1', 'app', dir);
    await run('repo', 'add', '1', 'lib', path.join(dir, 'lib'));
    const first = JSON.parse(await run('ticket', 'create', '--project', '1', '--title', 'a', '--json'));
    const second = JSON.parse(
      await run(
        'ticket',
        'create',
        '--project',
        '1',
        '--title',
        'b',
        '--repo',
        'app,lib',
        '--depends-on',
        String(first.ticket.id),
        '--design-needed',
        'false',
        '--json',
      ),
    );
    await anvil.tasks.idle();
    expect(second.ticket.targetRepos).toEqual(['app', 'lib']);
    expect(second.ticket.designNeeded).toBe(false);
    const detail = JSON.parse(await run('ticket', 'show', String(second.ticket.id), '--json'));
    expect(detail.detail.dependsOn).toHaveLength(1);
  });
});
