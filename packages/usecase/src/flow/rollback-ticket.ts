import { AnvilError, State, type Ticket } from '@anvil/entity';
import type { FindTicket } from '../find/find-ticket';
import type { RequestContext } from '../request-context';
import type { AddEntry } from '../ticket/add-entry';
import type { UseCase } from '../use-case';
import type { TransitionTicket } from './transition-ticket';

export interface RollbackTicketInput {
  ticketId: number;
  /** 理由(必須。エントリに残る) */
  reason: string;
  /** 省くと、カテゴリ内の最初の状態 */
  target?: State;
}

export interface RollbackTicketOutput {
  ticket: Ticket;
}

/** 差し戻し。誰でもできる(確定)。新しいエージェントを起動する(前のエージェントは再開しない)。 */
export class RollbackTicket implements UseCase<RollbackTicketInput, RollbackTicketOutput> {
  constructor(
    private readonly findTicket: FindTicket,
    private readonly addEntry: AddEntry,
    private readonly transitionTicket: TransitionTicket,
  ) {}

  async execute(ctx: RequestContext, input: RollbackTicketInput): Promise<RollbackTicketOutput> {
    const { ticket } = await this.findTicket.execute(ctx, { ticketId: input.ticketId });
    if (ticket.state === State.TODO || ticket.state === State.DONE) throw AnvilError.conflict('この状態からは差し戻せない');
    if (!input.reason.trim()) throw AnvilError.invalid('差し戻しの理由は必須');

    const target = input.target ?? ticket.defaultRollbackTarget();
    ticket.assertCanRollbackTo(target);
    await this.addEntry.execute(ctx, {
      ticketId: ticket.id,
      body: `【差し戻し: ${ticket.state.label} → ${target.label}】\n${input.reason}`,
    });
    return this.transitionTicket.execute(ctx, { ticketId: ticket.id, to: target });
  }
}
