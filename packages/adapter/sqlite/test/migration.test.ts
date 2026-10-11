import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import { SqliteDatabase } from '../src';

const tempFile = () => path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'anvil-migration-')), 'anvil.db');

describe('移行', () => {
  it('新しいデータベースは、最新のスキーマになり、開き直しても壊れない', () => {
    const file = tempFile();
    new SqliteDatabase(file);
    new SqliteDatabase(file); // 2 回目は、移行を飛ばす
  });

  it('移行の仕組みの無い古い形のデータベースは、分かるメッセージで止まる', () => {
    const file = tempFile();
    const legacy = new DatabaseSync(file);
    legacy.exec('CREATE TABLE projects (id INTEGER PRIMARY KEY)');
    legacy.close();
    expect(() => new SqliteDatabase(file)).toThrow(/古い形/);
  });
});
