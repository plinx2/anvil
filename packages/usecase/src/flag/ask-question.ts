import { AnvilError, type Ticket } from '@anvil/entity';
import type { FindTicket } from '../find/find-ticket';
import type { Clock, Notifier, TicketStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { AddEntry } from '../ticket/add-entry';
import type { UseCase } from '../use-case';

export interface AskQuestionInput {
  ticketId: number;
  question: string;
}

export interface AskQuestionOutput {
  ticket: Ticket;
}

/** 途中の質問。承認待ちフラグを立てる(質問は、エントリの本文)。回答があるまで、同じ状態で止まる。担当のロールだけ。 */
export class AskQuestion implements UseCase<AskQuestionInput, AskQuestionOutput> {
  constructor(
    private readonly tickets: TicketStore,
    private readonly notifier: Notifier,
    private readonly clock: Clock,
    private readonly findTicket: FindTicket,
    private readonly addEntry: AddEntry,
  ) {}

  async execute(ctx: RequestContext, input: AskQuestionInput): Promise<AskQuestionOutput> {
    const { ticket } = await this.findTicket.execute(ctx, { ticketId: input.ticketId });
    if (!ticket.hasAgent) throw AnvilError.conflict('エージェントのいる状態でだけ立てられる');
    ticket.assertOperableBy(ctx.actor);

    await this.addEntry.execute(ctx, { ticketId: ticket.id, body: input.question });
    const { ticket: current } = await this.findTicket.execute(ctx, { ticketId: ticket.id });
    const raised = current.raiseQuestion(this.clock.now(ctx));
    await this.tickets.save(ctx, raised);
    await this.notifier.notify(ctx, '承認待ち', `T-${ticket.id} ${ticket.title}`);
    return { ticket: raised };
  }
}
