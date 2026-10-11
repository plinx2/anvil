import type { NewOf, Repo } from '@anvil/entity';
import type { RepoStore, RequestContext } from '@anvil/usecase';
import { fromBool, type Row, toBool } from './row';
import type { SqliteDatabase } from './sqlite-database';

const toRepo = (r: Row): Repo => ({
  id: r.id,
  projectId: r.project_id,
  name: r.name,
  path: r.path,
  defaultBranch: r.default_branch,
  hasRemote: toBool(r.has_remote),
});

export class SqliteRepoStore implements RepoStore {
  constructor(private readonly database: SqliteDatabase) {}

  add(ctx: RequestContext, repo: NewOf<Repo>): Promise<Repo> {
    return this.database.access(ctx, (db) => {
      const result = db
        .prepare('INSERT INTO repos (project_id, name, path, default_branch, has_remote) VALUES (?,?,?,?,?)')
        .run(repo.projectId, repo.name, repo.path, repo.defaultBranch, fromBool(repo.hasRemote));
      return toRepo(db.prepare('SELECT * FROM repos WHERE id = ?').get(result.lastInsertRowid) as Row);
    });
  }

  listByProject(ctx: RequestContext, projectId: number): Promise<Repo[]> {
    return this.database.access(ctx, (db) =>
      (db.prepare('SELECT * FROM repos WHERE project_id = ? ORDER BY name').all(projectId) as Row[]).map(toRepo),
    );
  }

  findByPath(ctx: RequestContext, path: string): Promise<Repo | null> {
    return this.database.access(ctx, (db) => {
      const row = db.prepare('SELECT * FROM repos WHERE path = ?').get(path) as Row | undefined;
      return row ? toRepo(row) : null;
    });
  }

  deleteByProject(ctx: RequestContext, projectId: number): Promise<void> {
    return this.database.access(ctx, (db) => {
      db.prepare('DELETE FROM repos WHERE project_id = ?').run(projectId);
    });
  }
}
