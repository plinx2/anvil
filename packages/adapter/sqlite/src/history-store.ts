import { Actor, type History, type NewOf, State } from '@anvil/entity';
import type { HistoryStore, RequestContext } from '@anvil/usecase';
import type { Row } from './row';
import type { SqliteDatabase } from './sqlite-database';

const toHistory = (r: Row): History => ({
  id: r.id,
  ticketId: r.ticket_id,
  fromState: r.from_state ? State.of(r.from_state) : null,
  toState: State.of(r.to_state),
  actor: Actor.restore(r.actor_kind, r.actor_role),
  createdAt: r.created_at,
});

export class SqliteHistoryStore implements HistoryStore {
  constructor(private readonly database: SqliteDatabase) {}

  add(ctx: RequestContext, history: NewOf<History>): Promise<void> {
    return this.database.access(ctx, (db) => {
      db.prepare('INSERT INTO history (ticket_id, from_state, to_state, actor_kind, actor_role, created_at) VALUES (?,?,?,?,?,?)').run(
        history.ticketId,
        history.fromState?.id ?? null,
        history.toState.id,
        history.actor.kind,
        history.actor.role?.id ?? null,
        history.createdAt,
      );
    });
  }

  list(ctx: RequestContext, ticketId: number): Promise<History[]> {
    return this.database.access(ctx, (db) =>
      (db.prepare('SELECT * FROM history WHERE ticket_id = ? ORDER BY id').all(ticketId) as Row[]).map(toHistory),
    );
  }

  deleteByTicket(ctx: RequestContext, ticketId: number): Promise<void> {
    return this.database.access(ctx, (db) => {
      db.prepare('DELETE FROM history WHERE ticket_id = ?').run(ticketId);
    });
  }
}
