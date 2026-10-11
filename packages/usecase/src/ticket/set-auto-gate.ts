import { Actor, State, type Ticket } from '@anvil/entity';
import type { FindTicket } from '../find/find-ticket';
import type { PassPreImplGate } from '../flow/pass-pre-impl-gate';
import type { Clock, TaskRunner, TicketStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface SetAutoGateInput {
  ticketId: number;
  on: boolean;
}

export interface SetAutoGateOutput {
  ticket: Ticket;
}

/** 自動ゲート承認フラグの切り替え。起票後も切り替えられる。実装前ゲートにいるチケットは、ON にすると、そのまま突破する。 */
export class SetAutoGate implements UseCase<SetAutoGateInput, SetAutoGateOutput> {
  constructor(
    private readonly tickets: TicketStore,
    private readonly tasks: TaskRunner,
    private readonly clock: Clock,
    private readonly findTicket: FindTicket,
    private readonly passPreImplGate: PassPreImplGate,
  ) {}

  async execute(ctx: RequestContext, input: SetAutoGateInput): Promise<SetAutoGateOutput> {
    const { ticket } = await this.findTicket.execute(ctx, { ticketId: input.ticketId });
    const updated = ticket.withAutoGate(input.on, this.clock.now(ctx));
    await this.tickets.save(ctx, updated);
    if (input.on && updated.state === State.PRE_IMPL_GATE) {
      this.tasks.run(ctx, this.passPreImplGate.execute(ctx.withActor(Actor.auto()), { ticketId: updated.id }));
    }
    return { ticket: updated };
  }
}
