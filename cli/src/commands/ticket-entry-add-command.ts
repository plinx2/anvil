import { defineCommand } from 'citty';
import { type CliDeps, common, emit, guarded, toInt } from '../cli-deps';

/** anvil ticket entry add — エントリを追記する */
export const ticketEntryAddCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'add', description: 'エントリを追記する' },
    args: {
      ticketId: { type: 'positional', required: true, description: 'チケットの番号' },
      body: { type: 'positional', required: true, description: '本文' },
      ...common,
    },
    run: ({ args }) =>
      guarded(deps, async () => {
        emit(deps, args, await deps.service.tickets.appendEntry(deps.ctx, { ticketId: toInt('ticketId', args.ticketId), body: args.body }));
      }),
  });
