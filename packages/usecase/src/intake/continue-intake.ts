import { AnvilError } from '@anvil/entity';
import type { AgentRuntime, Clock, IntakeStore, LaunchStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';
import type { StartNextIntakeItem } from './start-next-intake-item';

export interface ContinueIntakeInput {
  itemId: number;
}

export type ContinueIntakeOutput = Record<string, never>;

/** 起票されたあとの続き。起票エージェントを終了し、次の項目へ進む(起票のトランザクションの外で行う)。 */
export class ContinueIntake implements UseCase<ContinueIntakeInput, ContinueIntakeOutput> {
  constructor(
    private readonly intakes: IntakeStore,
    private readonly launches: LaunchStore,
    private readonly agents: AgentRuntime,
    private readonly clock: Clock,
    private readonly startNextIntakeItem: StartNextIntakeItem,
  ) {}

  async execute(ctx: RequestContext, input: ContinueIntakeInput): Promise<ContinueIntakeOutput> {
    const item = await this.intakes.getItem(ctx, input.itemId);
    if (!item) throw AnvilError.notFound(`起票の依頼の項目が無い: ${input.itemId}`);
    for (const launch of await this.launches.activeByIntakeItem(ctx, item.id)) {
      await this.launches.end(ctx, launch.id, this.clock.now(ctx));
      await this.agents.stop(ctx, launch.name).catch(() => undefined);
    }
    await this.startNextIntakeItem.execute(ctx, { intakeId: item.intakeId });
    return {};
  }
}
