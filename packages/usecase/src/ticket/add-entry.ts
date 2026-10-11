import { AnvilError, type Entry, type State } from '@anvil/entity';
import type { FindTicket } from '../find/find-ticket';
import type { Clock, EntryStore, ProjectStore, TicketStore, Transactor } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface AddEntryInput {
  ticketId: number;
  body: string;
  /** 省くと、チケットの今の状態 */
  state?: State;
}

export interface AddEntryOutput {
  entry: Entry;
}

/** エントリを追記する。書き手は、文脈の主体(人間が書いたエントリのロールは 'human')。 */
export class AddEntry implements UseCase<AddEntryInput, AddEntryOutput> {
  constructor(
    private readonly entries: EntryStore,
    private readonly tickets: TicketStore,
    private readonly projects: ProjectStore,
    private readonly transactor: Transactor,
    private readonly clock: Clock,
    private readonly findTicket: FindTicket,
  ) {}

  async execute(ctx: RequestContext, input: AddEntryInput): Promise<AddEntryOutput> {
    if (!input.body.trim()) throw AnvilError.invalid('本文が空');
    const { ticket } = await this.findTicket.execute(ctx, { ticketId: input.ticketId });
    const at = this.clock.now(ctx);
    const entry = await this.transactor.transaction(ctx, async (tx) => {
      const added = await this.entries.add(tx, {
        ticketId: ticket.id,
        state: input.state ?? ticket.state,
        role: ctx.actor.entryRole,
        authorKind: ctx.actor.isRole ? 'agent' : 'human',
        body: input.body,
        createdAt: at,
      });
      await this.tickets.save(tx, ticket.edited({}, at));
      await this.projects.touch(tx, ticket.projectId, at);
      return added;
    });
    return { entry };
  }
}
