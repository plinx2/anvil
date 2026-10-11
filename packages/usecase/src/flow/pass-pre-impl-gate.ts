import { AnvilError, State, type Ticket } from '@anvil/entity';
import type { FindTicket } from '../find/find-ticket';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';
import type { TransitionTicket } from './transition-ticket';

export interface PassPreImplGateInput {
  ticketId: number;
}

export interface PassPreImplGateOutput {
  ticket: Ticket;
}

/** 実装前ゲートの突破。人間か、自動ゲート承認(フラグが ON のとき)だけ。ロールのエージェントは、突破できない。 */
export class PassPreImplGate implements UseCase<PassPreImplGateInput, PassPreImplGateOutput> {
  constructor(
    private readonly findTicket: FindTicket,
    private readonly transitionTicket: TransitionTicket,
  ) {}

  async execute(ctx: RequestContext, input: PassPreImplGateInput): Promise<PassPreImplGateOutput> {
    const { ticket } = await this.findTicket.execute(ctx, { ticketId: input.ticketId });
    if (ticket.state !== State.PRE_IMPL_GATE) throw AnvilError.conflict('実装前ゲートではない');
    if (ctx.actor.isRole) throw AnvilError.forbidden('実装前ゲートは、人間か、自動ゲート承認だけが突破できる');
    if (ctx.actor.isAuto && !ticket.autoGate) throw AnvilError.blocked('自動ゲート承認フラグが OFF');
    return this.transitionTicket.execute(ctx, { ticketId: ticket.id, to: ticket.nextState() });
  }
}
