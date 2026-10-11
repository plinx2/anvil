import type { Ticket } from '@anvil/entity';
import type { AgentRuntime, LaunchStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface IsAgentAliveInput {
  ticket: Ticket;
}

export interface IsAgentAliveOutput {
  alive: boolean;
}

/** 今の状態の担当エージェントが、動いているか(起動の記録があり、実行環境でも動いている)。 */
export class IsAgentAlive implements UseCase<IsAgentAliveInput, IsAgentAliveOutput> {
  constructor(
    private readonly launches: LaunchStore,
    private readonly agents: AgentRuntime,
  ) {}

  async execute(ctx: RequestContext, input: IsAgentAliveInput): Promise<IsAgentAliveOutput> {
    const { ticket } = input;
    const active = (await this.launches.activeByTicket(ctx, ticket.id)).find(
      (l) => l.role === ticket.state.role && l.state === ticket.state,
    );
    if (!active) return { alive: false };
    // 実行環境が分からない(null)ときは、anvil の記録を信じる
    return { alive: (await this.agents.isRunning(ctx, active.name)) ?? true };
  }
}
