import { defineCommand } from 'citty';
import { type CliDeps, common, emit, guarded, toInt, toNumber } from '../cli-deps';

/** anvil ticket gate design — 設計前ゲートを突破する(SP が必須。ブランチを切る) */
export const ticketGateDesignCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'design', description: '設計前ゲートを突破する(SP が必須。ブランチを切る)' },
    args: {
      ticketId: { type: 'positional', required: true, description: 'チケットの番号' },
      sp: { type: 'string', description: 'ストーリーポイント', required: true },
      ...common,
    },
    run: ({ args }) =>
      guarded(deps, async () => {
        emit(
          deps,
          args,
          await deps.service.flow.passDesignGate(deps.ctx, { ticketId: toInt('ticketId', args.ticketId), sp: toNumber('sp', args.sp) }),
        );
      }),
  });
