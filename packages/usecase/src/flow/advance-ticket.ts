import { AnvilError, type Ticket } from '@anvil/entity';
import type { ListUnmetDependencies } from '../dependency/list-unmet-dependencies';
import type { FindTicket } from '../find/find-ticket';
import type { RequestContext } from '../request-context';
import type { AddEntry } from '../ticket/add-entry';
import type { UseCase } from '../use-case';
import type { TransitionTicket } from './transition-ticket';

export interface AdvanceTicketInput {
  ticketId: number;
  /** 次のロールへの申し送り(エントリにも残る) */
  handoff?: string;
}

export interface AdvanceTicketOutput {
  ticket: Ticket;
}

/** 担当のエージェントが、作業を終えて、次の状態へ進める。呼ぶと、そのエージェントは終了される。 */
export class AdvanceTicket implements UseCase<AdvanceTicketInput, AdvanceTicketOutput> {
  constructor(
    private readonly findTicket: FindTicket,
    private readonly listUnmetDependencies: ListUnmetDependencies,
    private readonly addEntry: AddEntry,
    private readonly transitionTicket: TransitionTicket,
  ) {}

  async execute(ctx: RequestContext, input: AdvanceTicketInput): Promise<AdvanceTicketOutput> {
    const { ticket } = await this.findTicket.execute(ctx, { ticketId: input.ticketId });
    if (!ticket.hasAgent) throw AnvilError.conflict(`この状態(${ticket.state.label})は、エージェントが進める状態ではない`);
    ticket.assertOperableBy(ctx.actor);
    if (ticket.awaiting) throw AnvilError.blocked('承認待ちフラグが立っている。人間の回答を待つ');
    const { tickets: unmet } = await this.listUnmetDependencies.execute(ctx, { ticketId: ticket.id });
    if (unmet.length > 0) throw AnvilError.blocked(`依存先が未完了のため、先へ進められない: ${unmet.map((u) => `T-${u.id}`).join(', ')}`);

    if (input.handoff?.trim()) await this.addEntry.execute(ctx, { ticketId: ticket.id, body: input.handoff });
    return this.transitionTicket.execute(ctx, { ticketId: ticket.id, to: ticket.nextState(), handoff: input.handoff });
  }
}
