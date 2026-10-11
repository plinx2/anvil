import type { EndAgents } from '../agent/end-agents';
import type { AddDependency } from '../dependency/add-dependency';
import type { IntakeStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { DiscardTicket } from '../ticket/discard-ticket';
import type { UseCase } from '../use-case';

export interface FinalizeIntakeInput {
  intakeId: number;
}

export type FinalizeIntakeOutput = Record<string, never>;

/**
 * 全部起票された。破棄 ON なら、元を破棄する。OFF なら、元が新しいチケットすべてに依存する(スパイクの完了まで、元が止まる)。
 * 呼び出したエージェントは、終了する。
 */
export class FinalizeIntake implements UseCase<FinalizeIntakeInput, FinalizeIntakeOutput> {
  constructor(
    private readonly intakes: IntakeStore,
    private readonly addDependency: AddDependency,
    private readonly discardTicket: DiscardTicket,
    private readonly endAgents: EndAgents,
  ) {}

  async execute(ctx: RequestContext, input: FinalizeIntakeInput): Promise<FinalizeIntakeOutput> {
    const intake = await this.intakes.get(ctx, input.intakeId);
    if (!intake) return {};
    await this.intakes.save(ctx, { ...intake, status: 'done' });
    if (!intake.sourceTicketId) return {};

    if (intake.discard) {
      await this.discardTicket.execute(ctx, { ticketId: intake.sourceTicketId });
      return {};
    }
    const created = (await this.intakes.items(ctx, intake.id)).map((i) => i.ticketId).filter((id): id is number => id !== null);
    for (const dependsOnId of created) await this.addDependency.execute(ctx, { ticketId: intake.sourceTicketId, dependsOnId });
    await this.endAgents.execute(ctx, { ticketId: intake.sourceTicketId });
    return {};
  }
}
