import type { Project } from '@anvil/entity';
import type { ProjectStore, RequestContext } from '@anvil/usecase';
import type { Row } from './row';
import type { SqliteDatabase } from './sqlite-database';

const toProject = (r: Row): Project => ({ id: r.id, name: r.name, createdAt: r.created_at, updatedAt: r.updated_at });

export class SqliteProjectStore implements ProjectStore {
  constructor(private readonly database: SqliteDatabase) {}

  create(ctx: RequestContext, name: string, at: string): Promise<Project> {
    return this.database.access(ctx, (db) => {
      const result = db.prepare('INSERT INTO projects (name, created_at, updated_at) VALUES (?,?,?)').run(name, at, at);
      return toProject(db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid) as Row);
    });
  }

  get(ctx: RequestContext, id: number): Promise<Project | null> {
    return this.database.access(ctx, (db) => {
      const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Row | undefined;
      return row ? toProject(row) : null;
    });
  }

  getByName(ctx: RequestContext, name: string): Promise<Project | null> {
    return this.database.access(ctx, (db) => {
      const row = db.prepare('SELECT * FROM projects WHERE name = ?').get(name) as Row | undefined;
      return row ? toProject(row) : null;
    });
  }

  list(ctx: RequestContext): Promise<Project[]> {
    return this.database.access(ctx, (db) =>
      (db.prepare('SELECT * FROM projects ORDER BY updated_at DESC, id DESC').all() as Row[]).map(toProject),
    );
  }

  touch(ctx: RequestContext, id: number, at: string): Promise<void> {
    return this.database.access(ctx, (db) => {
      db.prepare('UPDATE projects SET updated_at = ? WHERE id = ?').run(at, id);
    });
  }

  delete(ctx: RequestContext, id: number): Promise<void> {
    return this.database.access(ctx, (db) => {
      db.prepare('DELETE FROM projects WHERE id = ?').run(id);
    });
  }
}
