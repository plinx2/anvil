import type { DependencyStore, RequestContext } from '@anvil/usecase';
import type { Row } from './row';
import type { SqliteDatabase } from './sqlite-database';

export class SqliteDependencyStore implements DependencyStore {
  constructor(private readonly database: SqliteDatabase) {}

  add(ctx: RequestContext, ticketId: number, dependsOnId: number): Promise<void> {
    return this.database.access(ctx, (db) => {
      db.prepare('INSERT OR IGNORE INTO deps (ticket_id, depends_on_id) VALUES (?,?)').run(ticketId, dependsOnId);
    });
  }

  remove(ctx: RequestContext, ticketId: number, dependsOnId: number): Promise<void> {
    return this.database.access(ctx, (db) => {
      db.prepare('DELETE FROM deps WHERE ticket_id = ? AND depends_on_id = ?').run(ticketId, dependsOnId);
    });
  }

  dependsOn(ctx: RequestContext, ticketId: number): Promise<number[]> {
    return this.database.access(ctx, (db) =>
      (db.prepare('SELECT depends_on_id AS id FROM deps WHERE ticket_id = ? ORDER BY depends_on_id').all(ticketId) as Row[]).map(
        (r) => r.id as number,
      ),
    );
  }

  dependents(ctx: RequestContext, ticketId: number): Promise<number[]> {
    return this.database.access(ctx, (db) =>
      (db.prepare('SELECT ticket_id AS id FROM deps WHERE depends_on_id = ? ORDER BY ticket_id').all(ticketId) as Row[]).map(
        (r) => r.id as number,
      ),
    );
  }

  /** このチケットが関わる依存(両方向) */
  deleteByTicket(ctx: RequestContext, ticketId: number): Promise<void> {
    return this.database.access(ctx, (db) => {
      db.prepare('DELETE FROM deps WHERE ticket_id = ? OR depends_on_id = ?').run(ticketId, ticketId);
    });
  }
}
