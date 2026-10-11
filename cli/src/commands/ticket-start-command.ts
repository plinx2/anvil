import { State } from '@anvil/entity';
import { defineCommand } from 'citty';
import { type CliDeps, common, emit, guarded, toInt } from '../cli-deps';

/** anvil ticket start — TODO のチケットを、リファインへ進める */
export const ticketStartCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'start', description: 'TODO のチケットを、リファインへ進める' },
    args: {
      ticketId: { type: 'positional', required: true, description: 'チケットの番号' },
      ...common,
    },
    run: ({ args }) =>
      guarded(deps, async () => {
        const data = await deps.service.flow.start(deps.ctx, { ticketId: toInt('ticketId', args.ticketId) });
        emit(deps, args, data, `T-${data.ticket.id} を ${State.of(data.ticket.state).label} に進めた`);
      }),
  });
