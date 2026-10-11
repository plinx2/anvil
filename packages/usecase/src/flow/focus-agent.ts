import { AnvilError } from '@anvil/entity';
import type { AgentRuntime, LaunchStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface FocusAgentInput {
  ticketId: number;
}

export type FocusAgentOutput = Record<string, never>;

/** GUI から、該当のエージェントのペインを開く(人間は、そこで会話しに行く)。 */
export class FocusAgent implements UseCase<FocusAgentInput, FocusAgentOutput> {
  constructor(
    private readonly launches: LaunchStore,
    private readonly agents: AgentRuntime,
  ) {}

  async execute(ctx: RequestContext, input: FocusAgentInput): Promise<FocusAgentOutput> {
    const active = (await this.launches.activeByTicket(ctx, input.ticketId)).at(-1);
    if (!active) throw AnvilError.notFound('動いているエージェントがいない');
    await this.agents.focus(ctx, active.name);
    return {};
  }
}
