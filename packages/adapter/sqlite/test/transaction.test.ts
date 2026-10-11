import { Actor } from '@anvil/entity';
import { newRequestContext } from '@anvil/usecase';
import { describe, expect, it } from 'vitest';
import { SqliteDatabase, SqliteProjectStore, SqliteTransactor } from '../src';

const ctx = newRequestContext(Actor.human());
const AT = '2026-10-11T00:00:00.000Z';

function setup() {
  const database = new SqliteDatabase(':memory:');
  return { projects: new SqliteProjectStore(database), transactor: new SqliteTransactor(database) };
}

describe('トランザクション(文脈で運ぶ)', () => {
  it('成功したら、確定する', async () => {
    const { projects, transactor } = setup();
    await transactor.transaction(ctx, async (tx) => {
      await projects.create(tx, 'a', AT);
      await projects.create(tx, 'b', AT);
    });
    expect((await projects.list(ctx)).map((p) => p.name).sort()).toEqual(['a', 'b']);
  });

  it('失敗したら、すべて取り消す', async () => {
    const { projects, transactor } = setup();
    await expect(
      transactor.transaction(ctx, async (tx) => {
        await projects.create(tx, 'a', AT);
        throw new Error('途中で失敗');
      }),
    ).rejects.toThrow('途中で失敗');
    expect(await projects.list(ctx)).toEqual([]);
  });

  it('トランザクションの文脈でない操作は、終わるまで待たされる(途中の状態を見ない)', async () => {
    const { projects, transactor } = setup();
    let release = () => {};
    const hold = new Promise<void>((resolve) => (release = resolve));

    const inTransaction = transactor.transaction(ctx, async (tx) => {
      await projects.create(tx, 'a', AT);
      await hold; // 他のリクエストが、割り込もうとする
    });
    let seen: string[] | null = null;
    const outside = projects.list(ctx).then((list) => (seen = list.map((p) => p.name)));

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(seen).toBeNull(); // まだ待たされている
    release();
    await inTransaction;
    await outside;
    expect(seen).toEqual(['a']); // 確定した後に見える
  });

  it('入れ子は、外側のトランザクションに加わる', async () => {
    const { projects, transactor } = setup();
    await expect(
      transactor.transaction(ctx, async (outer) => {
        await transactor.transaction(outer, async (inner) => {
          await projects.create(inner, 'a', AT);
        });
        throw new Error('外側で失敗');
      }),
    ).rejects.toThrow();
    expect(await projects.list(ctx)).toEqual([]);
  });
});
