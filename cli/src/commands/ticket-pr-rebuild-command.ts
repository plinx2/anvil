import { defineCommand } from 'citty';
import { type CliDeps, common, emit, guarded, toInt } from '../cli-deps';

/** anvil ticket pr rebuild — PR を作り直す */
export const ticketPrRebuildCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'rebuild', description: 'PR を作り直す' },
    args: {
      ticketId: { type: 'positional', required: true, description: 'チケットの番号' },
      ...common,
    },
    run: ({ args }) =>
      guarded(deps, async () => {
        emit(deps, args, await deps.service.flow.rebuildPr(deps.ctx, { ticketId: toInt('ticketId', args.ticketId) }));
      }),
  });
