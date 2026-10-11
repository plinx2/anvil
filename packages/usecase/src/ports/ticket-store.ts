import type { NewTicketProps, Ticket } from '@anvil/entity';
import type { RequestContext } from '../request-context';

export interface TicketStore {
  create(ctx: RequestContext, ticket: NewTicketProps): Promise<Ticket>;
  get(ctx: RequestContext, id: number): Promise<Ticket | null>;
  list(ctx: RequestContext, filter?: { projectId?: number }): Promise<Ticket[]>;
  save(ctx: RequestContext, ticket: Ticket): Promise<void>;
  delete(ctx: RequestContext, id: number): Promise<void>;
  findBySlug(ctx: RequestContext, projectId: number, slug: string): Promise<Ticket | null>;
  /** 次に採番される番号(slug の代わりに使う) */
  nextId(ctx: RequestContext): Promise<number>;
  /** from 以上、to 未満に完了したチケットの数 */
  countDone(ctx: RequestContext, from: string, to: string): Promise<number>;
}
