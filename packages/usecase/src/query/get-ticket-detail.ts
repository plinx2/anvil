import type { Branch, Entry, History, Launch, Ticket } from '@anvil/entity';
import type { ListDependencies } from '../dependency/list-dependencies';
import type { ListDependents } from '../dependency/list-dependents';
import type { FindTicket } from '../find/find-ticket';
import type { BranchStore, EntryStore, HistoryStore, LaunchStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';
import type { SummarizeTicket } from './summarize-ticket';
import type { TicketSummary } from './ticket-summary';

export interface TicketDetail {
  summary: TicketSummary;
  entries: Entry[];
  dependsOn: Ticket[];
  dependents: Ticket[];
  launches: Launch[];
  history: History[];
  branches: Branch[];
}

export interface GetTicketDetailInput {
  ticketId: number;
}

export interface GetTicketDetailOutput {
  detail: TicketDetail;
}

/** チケットの詳細(エントリ、依存、起動の記録、状態の履歴、ブランチ)。 */
export class GetTicketDetail implements UseCase<GetTicketDetailInput, GetTicketDetailOutput> {
  constructor(
    private readonly entries: EntryStore,
    private readonly launches: LaunchStore,
    private readonly history: HistoryStore,
    private readonly branches: BranchStore,
    private readonly findTicket: FindTicket,
    private readonly listDependencies: ListDependencies,
    private readonly listDependents: ListDependents,
    private readonly summarizeTicket: SummarizeTicket,
  ) {}

  async execute(ctx: RequestContext, input: GetTicketDetailInput): Promise<GetTicketDetailOutput> {
    const { ticket } = await this.findTicket.execute(ctx, input);
    const detail: TicketDetail = {
      summary: (await this.summarizeTicket.execute(ctx, { ticket })).summary,
      entries: await this.entries.list(ctx, ticket.id),
      dependsOn: (await this.listDependencies.execute(ctx, input)).tickets,
      dependents: (await this.listDependents.execute(ctx, input)).tickets,
      launches: await this.launches.listByTicket(ctx, ticket.id),
      history: await this.history.list(ctx, ticket.id),
      branches: await this.branches.list(ctx, ticket.id),
    };
    return { detail };
  }
}
