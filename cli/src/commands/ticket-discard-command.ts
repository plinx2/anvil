import { defineCommand } from 'citty';
import { type CliDeps, common, emit, guarded, toInt } from '../cli-deps';

/** anvil ticket discard — チケットを破棄する(削除。ブランチとワークツリーは残す) */
export const ticketDiscardCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'discard', description: 'チケットを破棄する(削除。ブランチとワークツリーは残す)' },
    args: {
      ticketId: { type: 'positional', required: true, description: 'チケットの番号' },
      ...common,
    },
    run: ({ args }) =>
      guarded(deps, async () => {
        emit(deps, args, await deps.service.tickets.discard(deps.ctx, { ticketId: toInt('ticketId', args.ticketId) }));
      }),
  });
