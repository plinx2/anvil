import type { TicketStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';
import type { SummarizeTicket } from './summarize-ticket';
import type { TicketSummary } from './ticket-summary';

export interface GetBoardInput {
  projectId?: number;
}

export interface GetBoardOutput {
  tickets: TicketSummary[];
}

/** カンバン(チケットの一覧)。プロジェクトで絞れる。 */
export class GetBoard implements UseCase<GetBoardInput, GetBoardOutput> {
  constructor(
    private readonly tickets: TicketStore,
    private readonly summarizeTicket: SummarizeTicket,
  ) {}

  async execute(ctx: RequestContext, input: GetBoardInput): Promise<GetBoardOutput> {
    const tickets = await this.tickets.list(ctx, { projectId: input.projectId });
    const summaries = await Promise.all(tickets.map(async (ticket) => (await this.summarizeTicket.execute(ctx, { ticket })).summary));
    return { tickets: summaries };
  }
}
