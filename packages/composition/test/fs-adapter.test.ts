import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Role } from '@anvil/entity';
import { FsContextStore, FsRoleDefinitions } from '@anvil/fs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { human } from './helpers';

const AGENTS_DIR = path.resolve(import.meta.dirname, '..', '..', '..', 'agents');

describe('FsRoleDefinitions(ロールの定義の本文)', () => {
  const definitions = new FsRoleDefinitions(AGENTS_DIR);

  it('すべてのロールに、定義の本文がある(ファイル名の対応漏れ、ファイルの欠落を検出する)', () => {
    for (const role of Role.all) {
      expect(definitions.roleDoc(human, role).trim().length, role.id).toBeGreaterThan(0);
    }
  });

  it('コーディングの原則を読める', () => {
    expect(definitions.codingPrinciples(human).trim().length).toBeGreaterThan(0);
  });

  it('定義が無ければ、黙って空にせず、失敗する(エージェントを定義無しで動かさない)', () => {
    const empty = new FsRoleDefinitions(path.join(os.tmpdir(), 'anvil-no-such-agents-dir'));

    expect(() => empty.roleDoc(human, Role.CODER)).toThrow(/ENOENT/);
  });
});

describe('FsContextStore(プロジェクトコンテキスト)', () => {
  let home: string;
  let store: FsContextStore;

  beforeEach(() => {
    home = fs.mkdtempSync(path.join(os.tmpdir(), 'anvil-context-'));
    store = new FsContextStore(home);
  });
  afterEach(() => fs.rmSync(home, { recursive: true, force: true }));

  it('作成すると、入口とロール別のディレクトリができる。作り直しても、書いた内容は消えない', async () => {
    await store.ensure(human, 'demo');
    const index = store.indexPath(human, 'demo');
    expect(fs.existsSync(index)).toBe(true);
    expect(fs.existsSync(path.dirname(store.rolePagePath(human, 'demo', Role.CODER)))).toBe(true);

    fs.writeFileSync(index, '# 書き換えた');
    await store.ensure(human, 'demo');

    expect(fs.readFileSync(index, 'utf8')).toBe('# 書き換えた');
  });

  it('パスは、すべて dirPath の中(エージェントに許可する場所に収まる)', async () => {
    const dir = store.dirPath(human, 'demo');

    expect(path.dirname(store.indexPath(human, 'demo'))).toBe(dir);
    for (const role of Role.all) expect(store.rolePagePath(human, 'demo', role).startsWith(dir + path.sep), role.id).toBe(true);
  });

  it('ロール別のページ名は、ロールの id の _ を - にしたもの', () => {
    expect(path.basename(store.rolePagePath(human, 'demo', Role.AC_REFINER))).toBe('ac-refiner.md');
  });

  it('ページの一覧は、入口からの相対パスで、Markdown だけ', async () => {
    await store.ensure(human, 'demo');
    fs.writeFileSync(store.rolePagePath(human, 'demo', Role.CODER), '# coder');
    fs.writeFileSync(path.join(store.dirPath(human, 'demo'), 'memo.txt'), 'x');

    const pages = await store.pages(human, 'demo');

    expect(pages.map((p) => p.path).sort()).toEqual(['index.md', 'roles/coder.md']);
  });
});
