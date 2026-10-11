import { AnvilError, type Ticket } from '@anvil/entity';
import type { IsAgentAlive } from '../agent/is-agent-alive';
import type { LaunchAgent } from '../agent/launch-agent';
import type { ListUnmetDependencies } from '../dependency/list-unmet-dependencies';
import type { FindTicket } from '../find/find-ticket';
import type { LaunchStore, TicketStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface StartAgentInput {
  ticketId: number;
}

export interface StartAgentOutput {
  ticket: Ticket;
}

/** 着手ボタン。動けるのに動いていないエージェントを、起動する(同じ状態の途中なら、再開する)。 */
export class StartAgent implements UseCase<StartAgentInput, StartAgentOutput> {
  constructor(
    private readonly tickets: TicketStore,
    private readonly launches: LaunchStore,
    private readonly findTicket: FindTicket,
    private readonly listUnmetDependencies: ListUnmetDependencies,
    private readonly isAgentAlive: IsAgentAlive,
    private readonly launchAgent: LaunchAgent,
  ) {}

  async execute(ctx: RequestContext, input: StartAgentInput): Promise<StartAgentOutput> {
    const { ticket } = await this.findTicket.execute(ctx, { ticketId: input.ticketId });
    if (!ticket.hasAgent) throw AnvilError.conflict('エージェントのいる状態ではない');
    if (ticket.awaiting) throw AnvilError.blocked('承認待ちフラグが立っている');
    const { tickets: unmet } = await this.listUnmetDependencies.execute(ctx, { ticketId: ticket.id });
    if (unmet.length > 0) throw AnvilError.blocked('依存先が未完了');
    const { alive } = await this.isAgentAlive.execute(ctx, { ticket });
    if (alive) throw AnvilError.conflict('エージェントは既に動いている');

    const resume = (await this.launches.listByTicket(ctx, ticket.id)).some((l) => l.state === ticket.state);
    await this.tickets.save(ctx, ticket.withLaunchError(null));
    const { ticket: cleared } = await this.findTicket.execute(ctx, { ticketId: ticket.id });
    await this.launchAgent.execute(ctx, {
      ticket: cleared,
      resume,
      note: resume ? '作業を再開する。最新のエントリを読んで続ける。' : undefined,
    });
    return this.findTicket.execute(ctx, { ticketId: ticket.id });
  }
}
