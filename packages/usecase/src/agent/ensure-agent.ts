import type { Ticket } from '@anvil/entity';
import type { ListUnmetDependencies } from '../dependency/list-unmet-dependencies';
import type { AgentRuntime, LaunchStore, TicketStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';
import type { IsAgentAlive } from './is-agent-alive';
import type { LaunchAgent } from './launch-agent';

export interface EnsureAgentInput {
  ticket: Ticket;
  /** エージェントに伝えること(回答が追記された、など) */
  note: string;
}

export type EnsureAgentOutput = Record<string, never>;

/** 動けるのに動いていないエージェントを動かす。いれば、入力を送る。承認待ち、依存待ちのときは、何もしない。 */
export class EnsureAgent implements UseCase<EnsureAgentInput, EnsureAgentOutput> {
  constructor(
    private readonly tickets: TicketStore,
    private readonly launches: LaunchStore,
    private readonly agents: AgentRuntime,
    private readonly isAgentAlive: IsAgentAlive,
    private readonly launchAgent: LaunchAgent,
    private readonly listUnmetDependencies: ListUnmetDependencies,
  ) {}

  async execute(ctx: RequestContext, input: EnsureAgentInput): Promise<EnsureAgentOutput> {
    const { ticket, note } = input;
    if (!ticket.hasAgent || ticket.awaiting) return {};
    const { tickets: unmet } = await this.listUnmetDependencies.execute(ctx, { ticketId: ticket.id });
    if (unmet.length > 0) return {};

    const { alive } = await this.isAgentAlive.execute(ctx, { ticket });
    if (alive) {
      const active = (await this.launches.activeByTicket(ctx, ticket.id)).at(-1);
      if (active) await this.sendOrRecordFailure(ctx, ticket, active.name, note);
      return {};
    }
    const resume = (await this.launches.listByTicket(ctx, ticket.id)).some((l) => l.state === ticket.state);
    await this.launchAgent.execute(ctx, { ticket, note, resume });
    return {};
  }

  private async sendOrRecordFailure(ctx: RequestContext, ticket: Ticket, name: string, note: string): Promise<void> {
    try {
      await this.agents.send(ctx, name, note);
    } catch (e) {
      const latest = await this.tickets.get(ctx, ticket.id);
      if (latest) await this.tickets.save(ctx, latest.withLaunchError(`送り込みに失敗した(人間が確認する): ${(e as Error).message}`));
    }
  }
}
