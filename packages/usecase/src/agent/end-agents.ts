import type { AgentRuntime, Clock, LaunchStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface EndAgentsInput {
  ticketId: number;
  /** 終了させない起動(今起動したばかりのもの) */
  exceptLaunchId?: number;
}

export type EndAgentsOutput = Record<string, never>;

/** チケットの稼働中のエージェントを、すべて終了する(終了させるのは anvil)。 */
export class EndAgents implements UseCase<EndAgentsInput, EndAgentsOutput> {
  constructor(
    private readonly launches: LaunchStore,
    private readonly agents: AgentRuntime,
    private readonly clock: Clock,
  ) {}

  async execute(ctx: RequestContext, input: EndAgentsInput): Promise<EndAgentsOutput> {
    for (const launch of await this.launches.activeByTicket(ctx, input.ticketId)) {
      if (launch.id === input.exceptLaunchId) continue;
      await this.launches.end(ctx, launch.id, this.clock.now(ctx));
      await this.agents.stop(ctx, launch.name).catch(() => undefined);
    }
    return {};
  }
}
