import { AnvilError, type Ticket } from '@anvil/entity';
import type { TicketStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface FindTicketInput {
  ticketId: number;
}

export interface FindTicketOutput {
  ticket: Ticket;
}

/** チケットを探す。無ければ、見つからないエラー。 */
export class FindTicket implements UseCase<FindTicketInput, FindTicketOutput> {
  constructor(private readonly tickets: TicketStore) {}

  async execute(ctx: RequestContext, input: FindTicketInput): Promise<FindTicketOutput> {
    const ticket = await this.tickets.get(ctx, input.ticketId);
    if (!ticket) throw AnvilError.notFound(`チケットが無い: ${input.ticketId}`);
    return { ticket };
  }
}
