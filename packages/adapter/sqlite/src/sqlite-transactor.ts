import type { RequestContext, Transactor } from '@anvil/usecase';
import type { SqliteDatabase } from './sqlite-database';

export class SqliteTransactor implements Transactor {
  constructor(private readonly database: SqliteDatabase) {}

  transaction<T>(ctx: RequestContext, fn: (txCtx: RequestContext) => Promise<T>): Promise<T> {
    return this.database.transaction(ctx, fn);
  }
}
