import { AnvilError } from '@anvil/entity';
import { defineCommand } from 'citty';
import { type CliDeps, common, emit, guarded, toInt } from '../cli-deps';

/** anvil ticket auto-gate — 自動ゲート承認フラグを切り替える */
export const ticketAutoGateCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'auto-gate', description: '自動ゲート承認フラグを切り替える' },
    args: {
      ticketId: { type: 'positional', required: true, description: 'チケットの番号' },
      onOff: { type: 'positional', required: true, description: 'on か off' },
      ...common,
    },
    run: ({ args }) =>
      guarded(deps, async () => {
        if (args.onOff !== 'on' && args.onOff !== 'off') throw AnvilError.invalid('on か off で指定する');
        emit(
          deps,
          args,
          await deps.service.tickets.changeAutoGate(deps.ctx, { ticketId: toInt('ticketId', args.ticketId), on: args.onOff === 'on' }),
        );
      }),
  });
