import { type Launch, type NewOf, Role, State } from '@anvil/entity';
import type { LaunchStore, RequestContext } from '@anvil/usecase';
import type { Row } from './row';
import type { SqliteDatabase } from './sqlite-database';

const toLaunch = (r: Row): Launch => ({
  id: r.id,
  ticketId: r.ticket_id,
  intakeItemId: r.intake_item_id,
  state: r.state ? State.of(r.state) : null,
  role: Role.of(r.role),
  name: r.name,
  sessionId: r.session_id,
  startedAt: r.started_at,
  endedAt: r.ended_at,
});

export class SqliteLaunchStore implements LaunchStore {
  constructor(private readonly database: SqliteDatabase) {}

  add(ctx: RequestContext, launch: NewOf<Launch>): Promise<Launch> {
    return this.database.access(ctx, (db) => {
      const result = db
        .prepare(
          'INSERT INTO launches (ticket_id, intake_item_id, state, role, name, session_id, started_at, ended_at) VALUES (?,?,?,?,?,?,?,?)',
        )
        .run(
          launch.ticketId,
          launch.intakeItemId,
          launch.state?.id ?? null,
          launch.role.id,
          launch.name,
          launch.sessionId,
          launch.startedAt,
          launch.endedAt,
        );
      return toLaunch(db.prepare('SELECT * FROM launches WHERE id = ?').get(result.lastInsertRowid) as Row);
    });
  }

  listByTicket(ctx: RequestContext, ticketId: number): Promise<Launch[]> {
    return this.database.access(ctx, (db) =>
      (db.prepare('SELECT * FROM launches WHERE ticket_id = ? ORDER BY id').all(ticketId) as Row[]).map(toLaunch),
    );
  }

  activeByTicket(ctx: RequestContext, ticketId: number): Promise<Launch[]> {
    return this.database.access(ctx, (db) =>
      (db.prepare('SELECT * FROM launches WHERE ticket_id = ? AND ended_at IS NULL ORDER BY id').all(ticketId) as Row[]).map(toLaunch),
    );
  }

  activeByIntakeItem(ctx: RequestContext, intakeItemId: number): Promise<Launch[]> {
    return this.database.access(ctx, (db) =>
      (db.prepare('SELECT * FROM launches WHERE intake_item_id = ? AND ended_at IS NULL ORDER BY id').all(intakeItemId) as Row[]).map(
        toLaunch,
      ),
    );
  }

  end(ctx: RequestContext, id: number, at: string): Promise<void> {
    return this.database.access(ctx, (db) => {
      db.prepare('UPDATE launches SET ended_at = ? WHERE id = ?').run(at, id);
    });
  }

  delete(ctx: RequestContext, id: number): Promise<void> {
    return this.database.access(ctx, (db) => {
      db.prepare('DELETE FROM launches WHERE id = ?').run(id);
    });
  }

  attachTicket(ctx: RequestContext, intakeItemId: number, ticketId: number): Promise<void> {
    return this.database.access(ctx, (db) => {
      db.prepare('UPDATE launches SET ticket_id = ? WHERE intake_item_id = ?').run(ticketId, intakeItemId);
    });
  }

  deleteByTicket(ctx: RequestContext, ticketId: number): Promise<void> {
    return this.database.access(ctx, (db) => {
      db.prepare('DELETE FROM launches WHERE ticket_id = ?').run(ticketId);
    });
  }

  deleteByIntakeItem(ctx: RequestContext, intakeItemId: number): Promise<void> {
    return this.database.access(ctx, (db) => {
      db.prepare('DELETE FROM launches WHERE intake_item_id = ?').run(intakeItemId);
    });
  }
}
