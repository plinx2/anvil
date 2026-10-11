import { defineCommand } from 'citty';
import { type CliDeps, common, emit, guarded, toInt } from '../cli-deps';

/** anvil ticket agent start — 動けるのに動いていないエージェントを起動・再開する */
export const ticketAgentStartCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'start', description: '動けるのに動いていないエージェントを起動・再開する' },
    args: {
      ticketId: { type: 'positional', required: true, description: 'チケットの番号' },
      ...common,
    },
    run: ({ args }) =>
      guarded(deps, async () => {
        emit(deps, args, await deps.service.flow.startAgentOf(deps.ctx, { ticketId: toInt('ticketId', args.ticketId) }));
      }),
  });
