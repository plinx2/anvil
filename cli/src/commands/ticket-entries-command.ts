import type { ListEntriesInput } from '@anvil/service';
import { StateIdSchema } from '@anvil/service';
import { defineCommand } from 'citty';
import { type CliDeps, common, emit, guarded, optInt, toInt } from '../cli-deps';

/** anvil ticket entries — エントリを読む(状態、直近の件数で絞れる) */
export const ticketEntriesCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'entries', description: 'エントリを読む(状態、直近の件数で絞れる)' },
    args: {
      ticketId: { type: 'positional', required: true, description: 'チケットの番号' },
      state: { type: 'enum', options: [...StateIdSchema.options], description: '状態で絞る' },
      limit: { type: 'string', description: '直近の件数' },
      ...common,
    },
    run: ({ args }) =>
      guarded(deps, async () => {
        emit(
          deps,
          args,
          await deps.service.tickets.entries(deps.ctx, {
            ticketId: toInt('ticketId', args.ticketId),
            state: args.state as ListEntriesInput['state'],
            limit: optInt('limit', args.limit),
          }),
        );
      }),
  });
