import type { History, NewOf } from '@anvil/entity';
import type { RequestContext } from '../request-context';

export interface HistoryStore {
  add(ctx: RequestContext, history: NewOf<History>): Promise<void>;
  list(ctx: RequestContext, ticketId: number): Promise<History[]>;
  deleteByTicket(ctx: RequestContext, ticketId: number): Promise<void>;
}
