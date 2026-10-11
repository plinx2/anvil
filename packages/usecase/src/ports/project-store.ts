import type { Project } from '@anvil/entity';
import type { RequestContext } from '../request-context';

export interface ProjectStore {
  create(ctx: RequestContext, name: string, at: string): Promise<Project>;
  get(ctx: RequestContext, id: number): Promise<Project | null>;
  getByName(ctx: RequestContext, name: string): Promise<Project | null>;
  /** 更新の新しい順 */
  list(ctx: RequestContext): Promise<Project[]>;
  delete(ctx: RequestContext, id: number): Promise<void>;
  touch(ctx: RequestContext, id: number, at: string): Promise<void>;
}
