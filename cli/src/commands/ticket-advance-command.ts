import { defineCommand } from 'citty';
import { type CliDeps, common, emit, guarded, toInt } from '../cli-deps';

/** anvil ticket advance — 次の状態へ進める(申し送りを添えられる) */
export const ticketAdvanceCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'advance', description: '次の状態へ進める(申し送りを添えられる)' },
    args: {
      ticketId: { type: 'positional', required: true, description: 'チケットの番号' },
      handoff: { type: 'string', description: '次のロールへの申し送り' },
      ...common,
    },
    run: ({ args }) =>
      guarded(deps, async () => {
        emit(deps, args, await deps.service.flow.advance(deps.ctx, { ticketId: toInt('ticketId', args.ticketId), handoff: args.handoff }));
      }),
  });
