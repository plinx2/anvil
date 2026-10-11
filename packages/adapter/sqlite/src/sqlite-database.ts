import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { ContextKey, type RequestContext } from '@anvil/usecase';
import { MIGRATIONS } from './schema';

/** 文脈に載せる、トランザクションの目印。この文脈で呼んだ操作だけが、トランザクションの中で動く。 */
const TRANSACTION = new ContextKey<symbol>('sqlite.transaction');

/**
 * SQLite の接続と、トランザクションの境界。接続は 1 つ。
 * トランザクションの間は、そのトランザクションの文脈でない操作を待たせる(他のリクエストの操作が、紛れ込まないように)。
 */
export class SqliteDatabase {
  private readonly connection: DatabaseSync;
  private activeTransaction: symbol | null = null;
  private idleWaiters: Array<() => void> = [];

  constructor(file: string) {
    if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
    this.connection = new DatabaseSync(file);
    // 他のプロセス(HTTP API と MCP など)が、同じファイルを使う
    this.connection.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');
    this.migrate();
  }

  /** store が、SQL を実行する入口。トランザクション中は、その文脈だけが通る。 */
  async access<T>(ctx: RequestContext, run: (connection: DatabaseSync) => T): Promise<T> {
    const own = ctx.get(TRANSACTION);
    while (this.activeTransaction !== null && this.activeTransaction !== own) await this.waitUntilIdle();
    return run(this.connection);
  }

  /** トランザクションを開始し、fn にその文脈を渡す。fn が失敗したら、取り消す。既にトランザクションの中なら、それに加わる。 */
  async transaction<T>(ctx: RequestContext, fn: (txCtx: RequestContext) => Promise<T>): Promise<T> {
    if (ctx.get(TRANSACTION) !== undefined) return fn(ctx);

    while (this.activeTransaction !== null) await this.waitUntilIdle();
    const id = Symbol('transaction');
    this.activeTransaction = id;
    this.connection.exec('BEGIN IMMEDIATE');
    try {
      const result = await fn(ctx.with(TRANSACTION, id));
      this.connection.exec('COMMIT');
      return result;
    } catch (e) {
      this.connection.exec('ROLLBACK');
      throw e;
    } finally {
      this.activeTransaction = null;
      const waiters = this.idleWaiters;
      this.idleWaiters = [];
      for (const wake of waiters) wake();
    }
  }

  private hasTables(): boolean {
    const row = this.connection
      .prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
      .get() as {
      n: number;
    };
    return row.n > 0;
  }

  private waitUntilIdle(): Promise<void> {
    return new Promise((resolve) => this.idleWaiters.push(resolve));
  }

  private migrate(): void {
    const row = this.connection.prepare('PRAGMA user_version').get() as { user_version: number };
    if (row.user_version === 0 && this.hasTables()) {
      throw new Error(
        'データベースが、移行の仕組みの無い古い形(試作版)で作られている。データが要らなければ、ファイルを退避してから、起動し直す。',
      );
    }
    for (let version = row.user_version; version < MIGRATIONS.length; version++) {
      this.connection.exec(MIGRATIONS[version] ?? '');
      this.connection.exec(`PRAGMA user_version = ${version + 1}`);
    }
  }
}
