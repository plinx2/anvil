import { AnvilError, State, type Ticket } from '@anvil/entity';
import type { FindTicket } from '../find/find-ticket';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';
import type { TransitionTicket } from './transition-ticket';

export interface PassPreDoneGateInput {
  ticketId: number;
}

export interface PassPreDoneGateOutput {
  ticket: Ticket;
}

/** 完了前ゲートの突破(チケットを完了にする)。必ず人間。自動化しない。 */
export class PassPreDoneGate implements UseCase<PassPreDoneGateInput, PassPreDoneGateOutput> {
  constructor(
    private readonly findTicket: FindTicket,
    private readonly transitionTicket: TransitionTicket,
  ) {}

  async execute(ctx: RequestContext, input: PassPreDoneGateInput): Promise<PassPreDoneGateOutput> {
    const { ticket } = await this.findTicket.execute(ctx, { ticketId: input.ticketId });
    if (ticket.state !== State.PRE_DONE_GATE) throw AnvilError.conflict('完了前ゲートではない');
    if (!ctx.actor.isHuman) throw AnvilError.forbidden('完了前ゲートは、人間だけが突破できる');
    return this.transitionTicket.execute(ctx, { ticketId: ticket.id, to: ticket.nextState() });
  }
}
