import type { Branch } from '@anvil/entity';
import type { RequestContext } from '../request-context';

export interface BranchStore {
  upsert(ctx: RequestContext, branch: Branch): Promise<void>;
  list(ctx: RequestContext, ticketId: number): Promise<Branch[]>;
  deleteByTicket(ctx: RequestContext, ticketId: number): Promise<void>;
}
