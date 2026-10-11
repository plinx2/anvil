import type { Ticket } from '@anvil/entity';
import type { FindTicket } from '../find/find-ticket';
import type { EnsurePullRequest } from '../pull-request/ensure-pull-request';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface RebuildPullRequestInput {
  ticketId: number;
}

export interface RebuildPullRequestOutput {
  ticket: Ticket;
}

/** PR の作成に失敗したとき、作り直す。 */
export class RebuildPullRequest implements UseCase<RebuildPullRequestInput, RebuildPullRequestOutput> {
  constructor(
    private readonly findTicket: FindTicket,
    private readonly ensurePullRequest: EnsurePullRequest,
  ) {}

  async execute(ctx: RequestContext, input: RebuildPullRequestInput): Promise<RebuildPullRequestOutput> {
    await this.ensurePullRequest.execute(ctx, { ticketId: input.ticketId });
    return this.findTicket.execute(ctx, { ticketId: input.ticketId });
  }
}
