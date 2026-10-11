import { AnvilError, type Ticket } from '@anvil/entity';
import type { EnsureAgent } from '../agent/ensure-agent';
import type { FindTicket } from '../find/find-ticket';
import type { Clock, TicketStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { AddEntry } from '../ticket/add-entry';
import type { UseCase } from '../use-case';

export interface AnswerQuestionInput {
  ticketId: number;
  answer: string;
  /** 会話の中で、エージェントが代わりに書いたとき(書き手は人間)。そのエージェント自身には、送り込まない */
  viaAgent?: boolean;
}

export interface AnswerQuestionOutput {
  ticket: Ticket;
}

/** 承認待ちフラグへの回答。人間だけ。フラグが下りて、同じ状態が続く。エージェントがいなければ、再開して起動する。 */
export class AnswerQuestion implements UseCase<AnswerQuestionInput, AnswerQuestionOutput> {
  constructor(
    private readonly tickets: TicketStore,
    private readonly clock: Clock,
    private readonly findTicket: FindTicket,
    private readonly addEntry: AddEntry,
    private readonly ensureAgent: EnsureAgent,
  ) {}

  async execute(ctx: RequestContext, input: AnswerQuestionInput): Promise<AnswerQuestionOutput> {
    const { ticket } = await this.findTicket.execute(ctx, { ticketId: input.ticketId });
    if (!ticket.awaiting) throw AnvilError.conflict('承認待ちフラグが立っていない');
    if (ctx.actor.isRole) throw AnvilError.forbidden('回答できるのは人間だけ');

    await this.addEntry.execute(ctx, { ticketId: ticket.id, body: input.answer });
    const { ticket: current } = await this.findTicket.execute(ctx, { ticketId: ticket.id });
    const answered = current.answered(this.clock.now(ctx));
    await this.tickets.save(ctx, answered);
    if (!input.viaAgent)
      await this.ensureAgent.execute(ctx, { ticket: answered, note: '回答が追記された。最新のエントリを読んで、作業を続ける。' });
    return { ticket: answered };
  }
}
