import { defineCommand } from 'citty';
import { type CliDeps, common, emit, guarded, toInt } from '../cli-deps';

/** anvil ticket agent focus — エージェントのペインを前面に出す */
export const ticketAgentFocusCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'focus', description: 'エージェントのペインを前面に出す' },
    args: {
      ticketId: { type: 'positional', required: true, description: 'チケットの番号' },
      ...common,
    },
    run: ({ args }) =>
      guarded(deps, async () => {
        emit(deps, args, await deps.service.flow.focusAgentOf(deps.ctx, { ticketId: toInt('ticketId', args.ticketId) }));
      }),
  });
