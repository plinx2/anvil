import type { Ticket } from '@anvil/entity';
import type { DependencyStore, TicketStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface ListDependentsInput {
  ticketId: number;
}

export interface ListDependentsOutput {
  /** このチケットに依存しているもの(A が完了するまで、B は着手できない、の B) */
  tickets: Ticket[];
}

/** チケットに依存しているもの。 */
export class ListDependents implements UseCase<ListDependentsInput, ListDependentsOutput> {
  constructor(
    private readonly dependencies: DependencyStore,
    private readonly tickets: TicketStore,
  ) {}

  async execute(ctx: RequestContext, input: ListDependentsInput): Promise<ListDependentsOutput> {
    const ids = await this.dependencies.dependents(ctx, input.ticketId);
    const found = await Promise.all(ids.map((id) => this.tickets.get(ctx, id)));
    return { tickets: found.filter((t): t is Ticket => t !== null) };
  }
}
