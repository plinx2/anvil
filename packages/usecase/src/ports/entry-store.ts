import type { Entry, NewOf, State } from '@anvil/entity';
import type { RequestContext } from '../request-context';

export interface EntryStore {
  add(ctx: RequestContext, entry: NewOf<Entry>): Promise<Entry>;
  list(ctx: RequestContext, ticketId: number, filter?: { state?: State }): Promise<Entry[]>;
  count(ctx: RequestContext, ticketId: number): Promise<number>;
  deleteByTicket(ctx: RequestContext, ticketId: number): Promise<void>;
}
