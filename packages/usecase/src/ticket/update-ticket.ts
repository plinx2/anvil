import { AnvilError, Slug, type Ticket, type TicketEdit } from '@anvil/entity';
import type { FindTicket } from '../find/find-ticket';
import type { BranchStore, Clock, ProjectStore, RepoStore, TicketStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface UpdateTicketInput {
  ticketId: number;
  title?: string;
  body?: string;
  slug?: string;
  designNeeded?: boolean;
  targetRepos?: string[];
}

export interface UpdateTicketOutput {
  ticket: Ticket;
}

/** チケットの更新。誰でもできる(確定)。slug は、ブランチを切る前だけ変えられる。 */
export class UpdateTicket implements UseCase<UpdateTicketInput, UpdateTicketOutput> {
  constructor(
    private readonly tickets: TicketStore,
    private readonly repos: RepoStore,
    private readonly branches: BranchStore,
    private readonly projects: ProjectStore,
    private readonly clock: Clock,
    private readonly findTicket: FindTicket,
  ) {}

  async execute(ctx: RequestContext, input: UpdateTicketInput): Promise<UpdateTicketOutput> {
    const { ticket } = await this.findTicket.execute(ctx, { ticketId: input.ticketId });
    const patch: TicketEdit = {};

    if (input.slug !== undefined && input.slug !== ticket.slug) {
      if ((await this.branches.list(ctx, ticket.id)).length > 0) throw AnvilError.conflict('ブランチを切った後は、slug を変えられない');
      if (!Slug.isValid(input.slug)) throw AnvilError.invalid('slug に使えない文字がある');
      if (await this.tickets.findBySlug(ctx, ticket.projectId, input.slug)) throw AnvilError.conflict('slug が重複している');
      patch.slug = input.slug;
    }
    if (input.targetRepos) {
      const known = new Set((await this.repos.listByProject(ctx, ticket.projectId)).map((r) => r.name));
      for (const name of input.targetRepos) if (!known.has(name)) throw AnvilError.invalid(`リポジトリが無い: ${name}`);
      patch.targetRepos = input.targetRepos;
    }
    if (input.designNeeded !== undefined) {
      if (ticket.kind.isSpike && input.designNeeded) throw AnvilError.invalid('スパイクにデザインは要らない');
      patch.designNeeded = input.designNeeded;
    }
    if (input.title !== undefined) patch.title = input.title;
    if (input.body !== undefined) patch.body = input.body;

    const at = this.clock.now(ctx);
    const updated = ticket.edited(patch, at);
    await this.tickets.save(ctx, updated);
    await this.projects.touch(ctx, ticket.projectId, at);
    return { ticket: updated };
  }
}
