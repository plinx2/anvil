import type { EndAgents } from '../agent/end-agents';
import type { FindTicket } from '../find/find-ticket';
import type {
  BranchStore,
  Clock,
  DependencyStore,
  EntryStore,
  HistoryStore,
  LaunchStore,
  Notifier,
  ProjectStore,
  TicketStore,
  Transactor,
} from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface DiscardTicketInput {
  ticketId: number;
}

export interface DiscardTicketOutput {
  /** 残したブランチ(リポジトリ名:ブランチ名) */
  keptBranches: string[];
}

/**
 * チケットの破棄。破棄は削除(状態としては持たない)。
 * ブランチとワークツリーは、未マージの作業を失わないように、消さずに、人間に知らせる。
 */
export class DiscardTicket implements UseCase<DiscardTicketInput, DiscardTicketOutput> {
  constructor(
    private readonly tickets: TicketStore,
    private readonly entries: EntryStore,
    private readonly history: HistoryStore,
    private readonly launches: LaunchStore,
    private readonly branches: BranchStore,
    private readonly dependencies: DependencyStore,
    private readonly projects: ProjectStore,
    private readonly notifier: Notifier,
    private readonly transactor: Transactor,
    private readonly clock: Clock,
    private readonly findTicket: FindTicket,
    private readonly endAgents: EndAgents,
  ) {}

  async execute(ctx: RequestContext, input: DiscardTicketInput): Promise<DiscardTicketOutput> {
    const { ticket } = await this.findTicket.execute(ctx, { ticketId: input.ticketId });
    await this.endAgents.execute(ctx, { ticketId: ticket.id });
    const keptBranches = (await this.branches.list(ctx, ticket.id)).map((b) => `${b.repoName}:${b.branch}`);

    await this.transactor.transaction(ctx, async (tx) => {
      await this.entries.deleteByTicket(tx, ticket.id);
      await this.history.deleteByTicket(tx, ticket.id);
      await this.launches.deleteByTicket(tx, ticket.id);
      await this.branches.deleteByTicket(tx, ticket.id);
      await this.dependencies.deleteByTicket(tx, ticket.id);
      await this.tickets.delete(tx, ticket.id);
      await this.projects.touch(tx, ticket.projectId, this.clock.now(tx));
    });

    if (keptBranches.length > 0) {
      await this.notifier.notify(ctx, 'チケットを破棄', `T-${ticket.id}: ブランチとワークツリーは残してある(${keptBranches.join(', ')})`);
    }
    return { keptBranches };
  }
}
