import type { NewOf, Repo } from '@anvil/entity';
import type { RequestContext } from '../request-context';

/** リポジトリの更新できる項目(名前と所属は変えられない) */
export type RepoFields = Pick<Repo, 'defaultBranch' | 'hasRemote' | 'path'>;

export interface RepoStore {
  add(ctx: RequestContext, repo: NewOf<Repo>): Promise<Repo>;
  listByProject(ctx: RequestContext, projectId: number): Promise<Repo[]>;
  update(ctx: RequestContext, id: number, fields: RepoFields): Promise<Repo>;
  deleteByProject(ctx: RequestContext, projectId: number): Promise<void>;
  findByPath(ctx: RequestContext, path: string): Promise<Repo | null>;
}
