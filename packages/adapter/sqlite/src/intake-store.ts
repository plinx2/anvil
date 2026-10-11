import { type Intake, type IntakeItem, Kind, type NewOf, State } from '@anvil/entity';
import type { IntakeStore, RequestContext } from '@anvil/usecase';
import { fromBool, type Row, toBool } from './row';
import type { SqliteDatabase } from './sqlite-database';

const toIntake = (r: Row): Intake => ({
  id: r.id,
  projectId: r.project_id,
  sourceTicketId: r.source_ticket_id,
  discard: toBool(r.discard),
  status: r.status,
  createdAt: r.created_at,
});

const toItem = (r: Row): IntakeItem => ({
  id: r.id,
  intakeId: r.intake_id,
  seq: r.seq,
  wish: r.wish,
  kind: Kind.of(r.kind),
  startState: r.start_state ? State.of(r.start_state) : null,
  slug: r.slug,
  autoGate: toBool(r.auto_gate),
  dependsOn: JSON.parse(r.depends_on),
  ticketId: r.ticket_id,
  status: r.status,
});

export class SqliteIntakeStore implements IntakeStore {
  constructor(private readonly database: SqliteDatabase) {}

  create(ctx: RequestContext, intake: NewOf<Intake>, items: Array<NewOf<IntakeItem>>): Promise<{ intake: Intake; items: IntakeItem[] }> {
    return this.database.access(ctx, (db) => {
      const created = db
        .prepare('INSERT INTO intakes (project_id, source_ticket_id, discard, status, created_at) VALUES (?,?,?,?,?)')
        .run(intake.projectId, intake.sourceTicketId, fromBool(intake.discard), intake.status, intake.createdAt);
      const intakeId = Number(created.lastInsertRowid);
      for (const item of items) {
        db.prepare(
          'INSERT INTO intake_items (intake_id, seq, wish, kind, start_state, slug, auto_gate, depends_on, ticket_id, status) VALUES (?,?,?,?,?,?,?,?,?,?)',
        ).run(
          intakeId,
          item.seq,
          item.wish,
          item.kind.id,
          item.startState?.id ?? null,
          item.slug,
          fromBool(item.autoGate),
          JSON.stringify(item.dependsOn),
          item.ticketId,
          item.status,
        );
      }
      return {
        intake: toIntake(db.prepare('SELECT * FROM intakes WHERE id = ?').get(intakeId) as Row),
        items: (db.prepare('SELECT * FROM intake_items WHERE intake_id = ? ORDER BY seq').all(intakeId) as Row[]).map(toItem),
      };
    });
  }

  get(ctx: RequestContext, id: number): Promise<Intake | null> {
    return this.database.access(ctx, (db) => {
      const row = db.prepare('SELECT * FROM intakes WHERE id = ?').get(id) as Row | undefined;
      return row ? toIntake(row) : null;
    });
  }

  save(ctx: RequestContext, intake: Intake): Promise<void> {
    return this.database.access(ctx, (db) => {
      db.prepare('UPDATE intakes SET status = ? WHERE id = ?').run(intake.status, intake.id);
    });
  }

  items(ctx: RequestContext, intakeId: number): Promise<IntakeItem[]> {
    return this.database.access(ctx, (db) =>
      (db.prepare('SELECT * FROM intake_items WHERE intake_id = ? ORDER BY seq').all(intakeId) as Row[]).map(toItem),
    );
  }

  getItem(ctx: RequestContext, id: number): Promise<IntakeItem | null> {
    return this.database.access(ctx, (db) => {
      const row = db.prepare('SELECT * FROM intake_items WHERE id = ?').get(id) as Row | undefined;
      return row ? toItem(row) : null;
    });
  }

  saveItem(ctx: RequestContext, item: IntakeItem): Promise<void> {
    return this.database.access(ctx, (db) => {
      db.prepare('UPDATE intake_items SET status = ?, ticket_id = ? WHERE id = ?').run(item.status, item.ticketId, item.id);
    });
  }

  listByProject(ctx: RequestContext, projectId: number): Promise<Intake[]> {
    return this.database.access(ctx, (db) =>
      (db.prepare('SELECT * FROM intakes WHERE project_id = ? ORDER BY id').all(projectId) as Row[]).map(toIntake),
    );
  }

  deleteByProject(ctx: RequestContext, projectId: number): Promise<void> {
    return this.database.access(ctx, (db) => {
      db.prepare('DELETE FROM intake_items WHERE intake_id IN (SELECT id FROM intakes WHERE project_id = ?)').run(projectId);
      db.prepare('DELETE FROM intakes WHERE project_id = ?').run(projectId);
    });
  }
}
