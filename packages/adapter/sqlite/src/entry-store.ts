import { type Entry, type NewOf, State } from '@anvil/entity';
import type { EntryStore, RequestContext } from '@anvil/usecase';
import type { Row } from './row';
import type { SqliteDatabase } from './sqlite-database';

const toEntry = (r: Row): Entry => ({
  id: r.id,
  ticketId: r.ticket_id,
  state: State.of(r.state),
  role: r.role,
  authorKind: r.author_kind,
  body: r.body,
  createdAt: r.created_at,
});

export class SqliteEntryStore implements EntryStore {
  constructor(private readonly database: SqliteDatabase) {}

  add(ctx: RequestContext, entry: NewOf<Entry>): Promise<Entry> {
    return this.database.access(ctx, (db) => {
      const result = db
        .prepare('INSERT INTO entries (ticket_id, state, role, author_kind, body, created_at) VALUES (?,?,?,?,?,?)')
        .run(entry.ticketId, entry.state.id, entry.role, entry.authorKind, entry.body, entry.createdAt);
      return toEntry(db.prepare('SELECT * FROM entries WHERE id = ?').get(result.lastInsertRowid) as Row);
    });
  }

  list(ctx: RequestContext, ticketId: number, filter: { state?: State } = {}): Promise<Entry[]> {
    return this.database.access(ctx, (db) => {
      const rows = filter.state
        ? db.prepare('SELECT * FROM entries WHERE ticket_id = ? AND state = ? ORDER BY id').all(ticketId, filter.state.id)
        : db.prepare('SELECT * FROM entries WHERE ticket_id = ? ORDER BY id').all(ticketId);
      return (rows as Row[]).map(toEntry);
    });
  }

  count(ctx: RequestContext, ticketId: number): Promise<number> {
    return this.database.access(
      ctx,
      (db) => (db.prepare('SELECT COUNT(*) AS n FROM entries WHERE ticket_id = ?').get(ticketId) as Row).n as number,
    );
  }

  deleteByTicket(ctx: RequestContext, ticketId: number): Promise<void> {
    return this.database.access(ctx, (db) => {
      db.prepare('DELETE FROM entries WHERE ticket_id = ?').run(ticketId);
    });
  }
}
