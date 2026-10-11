import { defineCommand } from 'citty';
import { type CliDeps, common, emit, guarded, toInt } from '../cli-deps';

/** anvil ticket gate impl — 実装前ゲートを突破する */
export const ticketGateImplCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'impl', description: '実装前ゲートを突破する' },
    args: {
      ticketId: { type: 'positional', required: true, description: 'チケットの番号' },
      ...common,
    },
    run: ({ args }) =>
      guarded(deps, async () => {
        emit(deps, args, await deps.service.flow.passImplGate(deps.ctx, { ticketId: toInt('ticketId', args.ticketId) }));
      }),
  });
