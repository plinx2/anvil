import type { Ticket } from '@anvil/entity';
import type { DependencyStore, TicketStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface ListDependenciesInput {
  ticketId: number;
}

export interface ListDependenciesOutput {
  /** 依存している先(A が完了するまで、B は着手できない、の A) */
  tickets: Ticket[];
}

/** チケットが依存している先。 */
export class ListDependencies implements UseCase<ListDependenciesInput, ListDependenciesOutput> {
  constructor(
    private readonly dependencies: DependencyStore,
    private readonly tickets: TicketStore,
  ) {}

  async execute(ctx: RequestContext, input: ListDependenciesInput): Promise<ListDependenciesOutput> {
    const ids = await this.dependencies.dependsOn(ctx, input.ticketId);
    const found = await Promise.all(ids.map((id) => this.tickets.get(ctx, id)));
    return { tickets: found.filter((t): t is Ticket => t !== null) };
  }
}
