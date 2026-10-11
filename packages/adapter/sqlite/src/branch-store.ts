import type { Branch } from '@anvil/entity';
import type { BranchStore, RequestContext } from '@anvil/usecase';
import type { Row } from './row';
import type { SqliteDatabase } from './sqlite-database';

export class SqliteBranchStore implements BranchStore {
  constructor(private readonly database: SqliteDatabase) {}

  upsert(ctx: RequestContext, branch: Branch): Promise<void> {
    return this.database.access(ctx, (db) => {
      db.prepare('INSERT OR REPLACE INTO branches (ticket_id, repo_name, branch, worktree_path) VALUES (?,?,?,?)').run(
        branch.ticketId,
        branch.repoName,
        branch.branch,
        branch.worktreePath,
      );
    });
  }

  list(ctx: RequestContext, ticketId: number): Promise<Branch[]> {
    return this.database.access(ctx, (db) =>
      (db.prepare('SELECT * FROM branches WHERE ticket_id = ?').all(ticketId) as Row[]).map((r) => ({
        ticketId: r.ticket_id,
        repoName: r.repo_name,
        branch: r.branch,
        worktreePath: r.worktree_path,
      })),
    );
  }

  deleteByTicket(ctx: RequestContext, ticketId: number): Promise<void> {
    return this.database.access(ctx, (db) => {
      db.prepare('DELETE FROM branches WHERE ticket_id = ?').run(ticketId);
    });
  }
}
