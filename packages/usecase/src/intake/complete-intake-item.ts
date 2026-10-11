import { AnvilError } from '@anvil/entity';
import type { AddDependency } from '../dependency/add-dependency';
import type { IntakeStore, LaunchStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface CompleteIntakeItemInput {
  itemId: number;
  /** 起票されたチケット */
  ticketId: number;
}

export type CompleteIntakeItemOutput = Record<string, never>;

/** 起票の依頼の 1 件が、起票された。項目を完了にし、起票エージェントの起動の記録をチケットへ紐づけ、指定された依存を張る。 */
export class CompleteIntakeItem implements UseCase<CompleteIntakeItemInput, CompleteIntakeItemOutput> {
  constructor(
    private readonly intakes: IntakeStore,
    private readonly launches: LaunchStore,
    private readonly addDependency: AddDependency,
  ) {}

  async execute(ctx: RequestContext, input: CompleteIntakeItemInput): Promise<CompleteIntakeItemOutput> {
    const item = await this.intakes.getItem(ctx, input.itemId);
    if (!item) throw AnvilError.notFound(`起票の依頼の項目が無い: ${input.itemId}`);
    await this.intakes.saveItem(ctx, { ...item, status: 'done', ticketId: input.ticketId });
    await this.launches.attachTicket(ctx, item.id, input.ticketId);
    for (const dependsOnId of item.dependsOn) await this.addDependency.execute(ctx, { ticketId: input.ticketId, dependsOnId });
    return {};
  }
}
