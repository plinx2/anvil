import { Kind, type NewTicketProps, State, Ticket } from '@anvil/entity';
import type { RequestContext, TicketStore } from '@anvil/usecase';
import { fromBool, type Row, toBool } from './row';
import type { SqliteDatabase } from './sqlite-database';

const toTicket = (r: Row): Ticket =>
  new Ticket({
    id: r.id,
    projectId: r.project_id,
    title: r.title,
    body: r.body,
    kind: Kind.of(r.kind),
    state: State.of(r.state),
    awaiting: toBool(r.awaiting),
    autoGate: toBool(r.auto_gate),
    sp: r.sp,
    designNeeded: toBool(r.design_needed),
    slug: r.slug,
    targetRepos: JSON.parse(r.target_repos),
    prUrls: JSON.parse(r.pr_urls),
    prError: r.pr_error,
    launchError: r.launch_error,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    doneAt: r.done_at,
  });

export class SqliteTicketStore implements TicketStore {
  constructor(private readonly database: SqliteDatabase) {}

  create(ctx: RequestContext, ticket: NewTicketProps): Promise<Ticket> {
    return this.database.access(ctx, (db) => {
      const result = db
        .prepare(
          `INSERT INTO tickets (project_id, title, body, kind, state, awaiting, auto_gate, sp, design_needed, slug, target_repos, pr_urls, pr_error, launch_error, created_at, updated_at, done_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        )
        .run(
          ticket.projectId,
          ticket.title,
          ticket.body,
          ticket.kind.id,
          ticket.state.id,
          fromBool(ticket.awaiting),
          fromBool(ticket.autoGate),
          ticket.sp,
          fromBool(ticket.designNeeded),
          ticket.slug,
          JSON.stringify(ticket.targetRepos),
          JSON.stringify(ticket.prUrls),
          ticket.prError,
          ticket.launchError,
          ticket.createdAt,
          ticket.updatedAt,
          ticket.doneAt,
        );
      return toTicket(db.prepare('SELECT * FROM tickets WHERE id = ?').get(result.lastInsertRowid) as Row);
    });
  }

  get(ctx: RequestContext, id: number): Promise<Ticket | null> {
    return this.database.access(ctx, (db) => {
      const row = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id) as Row | undefined;
      return row ? toTicket(row) : null;
    });
  }

  list(ctx: RequestContext, filter: { projectId?: number } = {}): Promise<Ticket[]> {
    return this.database.access(ctx, (db) => {
      const rows =
        filter.projectId === undefined
          ? db.prepare('SELECT * FROM tickets ORDER BY id').all()
          : db.prepare('SELECT * FROM tickets WHERE project_id = ? ORDER BY id').all(filter.projectId);
      return (rows as Row[]).map(toTicket);
    });
  }

  save(ctx: RequestContext, ticket: Ticket): Promise<void> {
    return this.database.access(ctx, (db) => {
      db.prepare(
        `UPDATE tickets SET title=?, body=?, kind=?, state=?, awaiting=?, auto_gate=?, sp=?, design_needed=?, slug=?, target_repos=?, pr_urls=?, pr_error=?, launch_error=?, updated_at=?, done_at=? WHERE id=?`,
      ).run(
        ticket.title,
        ticket.body,
        ticket.kind.id,
        ticket.state.id,
        fromBool(ticket.awaiting),
        fromBool(ticket.autoGate),
        ticket.sp,
        fromBool(ticket.designNeeded),
        ticket.slug,
        JSON.stringify(ticket.targetRepos),
        JSON.stringify(ticket.prUrls),
        ticket.prError,
        ticket.launchError,
        ticket.updatedAt,
        ticket.doneAt,
        ticket.id,
      );
    });
  }

  delete(ctx: RequestContext, id: number): Promise<void> {
    return this.database.access(ctx, (db) => {
      db.prepare('DELETE FROM tickets WHERE id = ?').run(id);
    });
  }

  findBySlug(ctx: RequestContext, projectId: number, slug: string): Promise<Ticket | null> {
    return this.database.access(ctx, (db) => {
      const row = db.prepare('SELECT * FROM tickets WHERE project_id = ? AND slug = ?').get(projectId, slug) as Row | undefined;
      return row ? toTicket(row) : null;
    });
  }

  nextId(ctx: RequestContext): Promise<number> {
    return this.database.access(ctx, (db) => (db.prepare('SELECT COALESCE(MAX(id), 0) + 1 AS n FROM tickets').get() as Row).n as number);
  }

  countDone(ctx: RequestContext, from: string, to: string): Promise<number> {
    return this.database.access(
      ctx,
      (db) => (db.prepare('SELECT COUNT(*) AS n FROM tickets WHERE done_at >= ? AND done_at < ?').get(from, to) as Row).n as number,
    );
  }
}
