import { State, type Ticket } from '@anvil/entity';
import type { EnsureAgent } from '../agent/ensure-agent';
import type { Notifier } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';
import type { ListDependents } from './list-dependents';
import type { ListUnmetDependencies } from './list-unmet-dependencies';

export interface NotifyDependentsInput {
  /** 完了したチケット */
  ticket: Ticket;
}

export type NotifyDependentsOutput = Record<string, never>;

/**
 * チケットが完了したとき、それに依存していたものを動かす。
 * TODO は、自動ではリファインに進めず、「着手可」を人間に知らせる。作業の途中(スパイクの完了を待っていた DEV リファインなど)は、再開する。
 */
export class NotifyDependents implements UseCase<NotifyDependentsInput, NotifyDependentsOutput> {
  constructor(
    private readonly notifier: Notifier,
    private readonly listDependents: ListDependents,
    private readonly listUnmetDependencies: ListUnmetDependencies,
    private readonly ensureAgent: EnsureAgent,
  ) {}

  async execute(ctx: RequestContext, input: NotifyDependentsInput): Promise<NotifyDependentsOutput> {
    const done = input.ticket;
    const { tickets: dependents } = await this.listDependents.execute(ctx, { ticketId: done.id });
    for (const dependent of dependents) {
      if (dependent.isDone) continue;
      const { tickets: unmet } = await this.listUnmetDependencies.execute(ctx, { ticketId: dependent.id });
      if (unmet.length > 0) continue;

      if (dependent.state === State.TODO) {
        await this.notifier.notify(ctx, '着手可', `T-${dependent.id} ${dependent.title}(依存先が完了した)`);
      } else {
        await this.ensureAgent.execute(ctx, {
          ticket: dependent,
          note: `依存先 T-${done.id}「${done.title}」が完了した。そのエントリ(結果)を読んで、作業を再開する。`,
        });
      }
    }
    return {};
  }
}
