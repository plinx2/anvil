import type { NewOf, Repo } from '@anvil/entity';
import type { RequestContext } from '../request-context';

export interface RepoStore {
  add(ctx: RequestContext, repo: NewOf<Repo>): Promise<Repo>;
  listByProject(ctx: RequestContext, projectId: number): Promise<Repo[]>;
  deleteByProject(ctx: RequestContext, projectId: number): Promise<void>;
  findByPath(ctx: RequestContext, path: string): Promise<Repo | null>;
}
