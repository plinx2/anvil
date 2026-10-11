import type { RollbackTicketInput } from '@anvil/service';
import { StateIdSchema } from '@anvil/service';
import { defineCommand } from 'citty';
import { type CliDeps, common, emit, guarded, toInt } from '../cli-deps';

/** anvil ticket rollback — 差し戻す(理由は必須。戻り先を省くと、カテゴリ内の最初の状態) */
export const ticketRollbackCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'rollback', description: '差し戻す(理由は必須。戻り先を省くと、カテゴリ内の最初の状態)' },
    args: {
      ticketId: { type: 'positional', required: true, description: 'チケットの番号' },
      reason: { type: 'string', description: '理由', required: true },
      to: { type: 'enum', options: [...StateIdSchema.options], description: '戻り先の状態' },
      ...common,
    },
    run: ({ args }) =>
      guarded(deps, async () => {
        const data = await deps.service.flow.rollback(deps.ctx, {
          ticketId: toInt('ticketId', args.ticketId),
          reason: args.reason,
          target: args.to as RollbackTicketInput['target'],
        });
        emit(deps, args, data);
      }),
  });
