import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { trustFolder } from '@anvil/herdr-claude-cli';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('trustFolder(Claude Code の信頼確認を、起動前に済ませる)', () => {
  let dir: string;
  let env: NodeJS.ProcessEnv;
  let configFile: string;
  const read = () => JSON.parse(fs.readFileSync(configFile, 'utf8'));

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'anvil-trust-'));
    env = { CLAUDE_CONFIG_DIR: dir };
    configFile = path.join(dir, '.claude.json');
  });
  afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

  it('データ領域の配下だけ、信頼を登録し、ほかの設定は残す', () => {
    fs.writeFileSync(
      configFile,
      JSON.stringify({ theme: 'dark', projects: { 'C:/x': { hasTrustDialogAccepted: false, allowedTools: ['a'] } } }),
    );
    const root = path.join(dir, 'home');
    const cwd = path.join(root, 'sandbox', 'worktrees', 't1');

    expect(trustFolder(root, cwd, env)).toBe(true);

    const config = read();
    expect(config.theme).toBe('dark');
    expect(config.projects['C:/x']).toEqual({ hasTrustDialogAccepted: false, allowedTools: ['a'] });
    expect(config.projects[path.resolve(cwd).replace(/\\/g, '/')]).toEqual({ hasTrustDialogAccepted: true });
  });

  it('データ領域の外(利用者のリポジトリなど)は、信頼しない', () => {
    fs.writeFileSync(configFile, JSON.stringify({ projects: {} }));
    const root = path.join(dir, 'home');

    expect(trustFolder(root, path.join(dir, 'repo'), env)).toBe(false);
    expect(trustFolder(root, root, env)).toBe(false);
    expect(read().projects).toEqual({});
  });

  it('設定が壊れている、無いときは、何も書かずに false', () => {
    const root = path.join(dir, 'home');
    const cwd = path.join(root, 'w');

    expect(trustFolder(root, cwd, env)).toBe(false);
    expect(fs.existsSync(configFile)).toBe(false);

    fs.writeFileSync(configFile, '{ broken');
    expect(trustFolder(root, cwd, env)).toBe(false);
    expect(fs.readFileSync(configFile, 'utf8')).toBe('{ broken');
  });
});
