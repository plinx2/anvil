import { type NewOf, type Reflection, Role, State } from '@anvil/entity';
import type { ReflectionFilter, ReflectionStore, RequestContext } from '@anvil/usecase';
import type { Row } from './row';
import type { SqliteDatabase } from './sqlite-database';

const toReflection = (r: Row): Reflection => ({
  id: r.id,
  ticketId: r.ticket_id,
  role: Role.of(r.role),
  state: r.state ? State.of(r.state) : null,
  sessionId: r.session_id,
  good: r.good,
  trouble: r.trouble,
  hypothesis: r.hypothesis,
  proposal: r.proposal,
  target: r.target,
  evidence: r.evidence,
  status: r.status,
  rejectReason: r.reject_reason,
  createdAt: r.created_at,
  decidedAt: r.decided_at,
});

export class SqliteReflectionStore implements ReflectionStore {
  constructor(private readonly database: SqliteDatabase) {}

  add(ctx: RequestContext, reflection: NewOf<Reflection>): Promise<Reflection> {
    return this.database.access(ctx, (db) => {
      const result = db
        .prepare(
          `INSERT INTO reflections (ticket_id, role, state, session_id, good, trouble, hypothesis, proposal, target, evidence, status, reject_reason, created_at, decided_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        )
        .run(
          reflection.ticketId,
          reflection.role.id,
          reflection.state?.id ?? null,
          reflection.sessionId,
          reflection.good,
          reflection.trouble,
          reflection.hypothesis,
          reflection.proposal,
          reflection.target,
          reflection.evidence,
          reflection.status,
          reflection.rejectReason,
          reflection.createdAt,
          reflection.decidedAt,
        );
      return toReflection(db.prepare('SELECT * FROM reflections WHERE id = ?').get(result.lastInsertRowid) as Row);
    });
  }

  list(ctx: RequestContext, filter: ReflectionFilter): Promise<Reflection[]> {
    return this.database.access(ctx, (db) => {
      const conditions: string[] = [];
      const values: string[] = [];
      if (filter.status) {
        conditions.push('status = ?');
        values.push(filter.status);
      }
      if (filter.target) {
        conditions.push('target = ?');
        values.push(filter.target);
      }
      if (filter.role) {
        conditions.push('role = ?');
        values.push(filter.role);
      }
      const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      return (db.prepare(`SELECT * FROM reflections ${where} ORDER BY id DESC`).all(...values) as Row[]).map(toReflection);
    });
  }

  get(ctx: RequestContext, id: number): Promise<Reflection | null> {
    return this.database.access(ctx, (db) => {
      const row = db.prepare('SELECT * FROM reflections WHERE id = ?').get(id) as Row | undefined;
      return row ? toReflection(row) : null;
    });
  }

  save(ctx: RequestContext, reflection: Reflection): Promise<void> {
    return this.database.access(ctx, (db) => {
      db.prepare('UPDATE reflections SET status = ?, reject_reason = ?, decided_at = ? WHERE id = ?').run(
        reflection.status,
        reflection.rejectReason,
        reflection.decidedAt,
        reflection.id,
      );
    });
  }

  countPending(ctx: RequestContext): Promise<number> {
    return this.database.access(
      ctx,
      (db) => (db.prepare("SELECT COUNT(*) AS n FROM reflections WHERE status = 'pending'").get() as Row).n as number,
    );
  }

  deleteByTicket(ctx: RequestContext, ticketId: number): Promise<void> {
    return this.database.access(ctx, (db) => {
      db.prepare('DELETE FROM reflections WHERE ticket_id = ?').run(ticketId);
    });
  }
}
