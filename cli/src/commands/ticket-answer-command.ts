import { defineCommand } from 'citty';
import { type CliDeps, common, emit, guarded, toInt } from '../cli-deps';

/** anvil ticket answer — 承認待ちフラグに回答する(同じ状態が続く) */
export const ticketAnswerCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'answer', description: '承認待ちフラグに回答する(同じ状態が続く)' },
    args: {
      ticketId: { type: 'positional', required: true, description: 'チケットの番号' },
      answer: { type: 'positional', required: true, description: '回答' },
      ...common,
    },
    run: ({ args }) =>
      guarded(deps, async () => {
        emit(deps, args, await deps.service.flags.answer(deps.ctx, { ticketId: toInt('ticketId', args.ticketId), answer: args.answer }));
      }),
  });
