import type { NewOf, Reflection } from '@anvil/entity';
import type { RequestContext } from '../request-context';

export interface ReflectionFilter {
  status?: string;
  target?: string;
  role?: string;
}

export interface ReflectionStore {
  add(ctx: RequestContext, reflection: NewOf<Reflection>): Promise<Reflection>;
  list(ctx: RequestContext, filter: ReflectionFilter): Promise<Reflection[]>;
  get(ctx: RequestContext, id: number): Promise<Reflection | null>;
  save(ctx: RequestContext, reflection: Reflection): Promise<void>;
  /** チケットに結びついた振り返りを消す */
  deleteByTicket(ctx: RequestContext, ticketId: number): Promise<void>;
  countPending(ctx: RequestContext): Promise<number>;
}
