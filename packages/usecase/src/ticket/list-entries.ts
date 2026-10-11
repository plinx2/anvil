import type { Entry, State } from '@anvil/entity';
import type { FindTicket } from '../find/find-ticket';
import type { EntryStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface ListEntriesInput {
  ticketId: number;
  state?: State;
  /** 直近の件数 */
  limit?: number;
}

export interface ListEntriesOutput {
  /** チケットの総件数(読み足りないことに気づけるように) */
  total: number;
  entries: Entry[];
}

export class ListEntries implements UseCase<ListEntriesInput, ListEntriesOutput> {
  constructor(
    private readonly entries: EntryStore,
    private readonly findTicket: FindTicket,
  ) {}

  async execute(ctx: RequestContext, input: ListEntriesInput): Promise<ListEntriesOutput> {
    await this.findTicket.execute(ctx, { ticketId: input.ticketId });
    const entries = await this.entries.list(ctx, input.ticketId, { state: input.state });
    return { total: await this.entries.count(ctx, input.ticketId), entries: input.limit ? entries.slice(-input.limit) : entries };
  }
}
