import { AnvilError, State, type Ticket } from '@anvil/entity';
import type { ListUnmetDependencies } from '../dependency/list-unmet-dependencies';
import type { FindTicket } from '../find/find-ticket';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';
import type { TransitionTicket } from './transition-ticket';

export interface StartTicketInput {
  ticketId: number;
}

export interface StartTicketOutput {
  ticket: Ticket;
}

/** TODO → リファイン。人間、または人間に依頼された Claude が進める。依存先が未完了なら、進められない。 */
export class StartTicket implements UseCase<StartTicketInput, StartTicketOutput> {
  constructor(
    private readonly findTicket: FindTicket,
    private readonly listUnmetDependencies: ListUnmetDependencies,
    private readonly transitionTicket: TransitionTicket,
  ) {}

  async execute(ctx: RequestContext, input: StartTicketInput): Promise<StartTicketOutput> {
    const { ticket } = await this.findTicket.execute(ctx, { ticketId: input.ticketId });
    if (ticket.state !== State.TODO) throw AnvilError.conflict('TODO のチケットだけ進められる');
    const { tickets: unmet } = await this.listUnmetDependencies.execute(ctx, { ticketId: ticket.id });
    if (unmet.length > 0) throw AnvilError.blocked(`依存先が未完了: ${unmet.map((u) => `T-${u.id}`).join(', ')}`);
    return this.transitionTicket.execute(ctx, { ticketId: ticket.id, to: ticket.nextState() });
  }
}
