import { Actor, State, type Ticket } from '@anvil/entity';
import type { FindTicket } from '../find/find-ticket';
import type { Clock, HistoryStore, ProjectStore, TicketStore, Transactor } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';
import type { OnTicketEntered } from './on-ticket-entered';

export interface TransitionTicketInput {
  ticketId: number;
  to: State;
  /** 次のロールへの申し送り */
  handoff?: string;
  note?: string;
}

export interface TransitionTicketOutput {
  ticket: Ticket;
}

/**
 * チケットの状態を変える(状態、履歴を、1 つのトランザクションで)。そのあと、新しい状態の後始末をする。
 * 実装前ゲートに入り、自動ゲート承認フラグが ON なら、判断なしで、そのまま突破する。
 */
export class TransitionTicket implements UseCase<TransitionTicketInput, TransitionTicketOutput> {
  constructor(
    private readonly tickets: TicketStore,
    private readonly history: HistoryStore,
    private readonly projects: ProjectStore,
    private readonly transactor: Transactor,
    private readonly clock: Clock,
    private readonly findTicket: FindTicket,
    private readonly onTicketEntered: OnTicketEntered,
  ) {}

  async execute(ctx: RequestContext, input: TransitionTicketInput): Promise<TransitionTicketOutput> {
    const { ticket: before } = await this.findTicket.execute(ctx, { ticketId: input.ticketId });
    const at = this.clock.now(ctx);
    const moved = before.moveTo(input.to, at);

    await this.transactor.transaction(ctx, async (tx) => {
      await this.tickets.save(tx, moved);
      await this.history.add(tx, { ticketId: moved.id, fromState: before.state, toState: moved.state, actor: ctx.actor, createdAt: at });
      await this.projects.touch(tx, moved.projectId, at);
    });

    await this.onTicketEntered.execute(ctx, { ticket: moved, handoff: input.handoff, note: input.note });

    const { ticket: latest } = await this.findTicket.execute(ctx, { ticketId: moved.id });
    if (latest.state === State.PRE_IMPL_GATE && latest.autoGate) {
      return this.execute(ctx.withActor(Actor.auto()), { ticketId: latest.id, to: latest.nextState() });
    }
    return { ticket: latest };
  }
}
