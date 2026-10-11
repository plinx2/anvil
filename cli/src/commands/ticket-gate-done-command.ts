import { defineCommand } from 'citty';
import { type CliDeps, common, emit, guarded, toInt } from '../cli-deps';

/** anvil ticket gate done — 完了前ゲートを突破する(完了にする) */
export const ticketGateDoneCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'done', description: '完了前ゲートを突破する(完了にする)' },
    args: {
      ticketId: { type: 'positional', required: true, description: 'チケットの番号' },
      ...common,
    },
    run: ({ args }) =>
      guarded(deps, async () => {
        emit(deps, args, await deps.service.flow.passDoneGate(deps.ctx, { ticketId: toInt('ticketId', args.ticketId) }));
      }),
  });
