import type { Ticket } from '@anvil/entity';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';
import type { ListDependencies } from './list-dependencies';

export interface ListUnmetDependenciesInput {
  ticketId: number;
}

export interface ListUnmetDependenciesOutput {
  /** 依存先のうち、まだ完了していないもの */
  tickets: Ticket[];
}

/** 依存先のうち、まだ完了していないもの。 */
export class ListUnmetDependencies implements UseCase<ListUnmetDependenciesInput, ListUnmetDependenciesOutput> {
  constructor(private readonly listDependencies: ListDependencies) {}

  async execute(ctx: RequestContext, input: ListUnmetDependenciesInput): Promise<ListUnmetDependenciesOutput> {
    const { tickets } = await this.listDependencies.execute(ctx, { ticketId: input.ticketId });
    return { tickets: tickets.filter((t) => !t.isDone) };
  }
}
