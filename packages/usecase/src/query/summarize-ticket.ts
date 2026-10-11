import type { Ticket } from '@anvil/entity';
import type { ListDependencies } from '../dependency/list-dependencies';
import type { EntryStore, HistoryStore, LaunchStore, ProjectStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';
import type { TicketSummary } from './ticket-summary';

export interface SummarizeTicketInput {
  ticket: Ticket;
}

export interface SummarizeTicketOutput {
  summary: TicketSummary;
}

/** チケットを、画面に見せる形にまとめる。 */
export class SummarizeTicket implements UseCase<SummarizeTicketInput, SummarizeTicketOutput> {
  constructor(
    private readonly projects: ProjectStore,
    private readonly entries: EntryStore,
    private readonly history: HistoryStore,
    private readonly launches: LaunchStore,
    private readonly listDependencies: ListDependencies,
  ) {}

  async execute(ctx: RequestContext, input: SummarizeTicketInput): Promise<SummarizeTicketOutput> {
    const { ticket } = input;
    const project = await this.projects.get(ctx, ticket.projectId);
    const entries = await this.entries.list(ctx, ticket.id);
    const history = await this.history.list(ctx, ticket.id);
    const active = await this.launches.activeByTicket(ctx, ticket.id);
    const { tickets: dependencies } = await this.listDependencies.execute(ctx, { ticketId: ticket.id });

    const summary: TicketSummary = {
      ticket,
      projectName: project?.name ?? '',
      ready: ticket.isReadyToStart(dependencies),
      unmetDependencyIds: dependencies.filter((d) => !d.isDone).map((d) => d.id),
      agentActive: active.some((l) => l.state === ticket.state),
      lastEntryAt: entries.at(-1)?.createdAt ?? ticket.updatedAt,
      entryCount: entries.length,
      rollbackCount: history.filter((h) => h.fromState !== null && h.toState.isBefore(h.fromState)).length,
    };
    return { summary };
  }
}
