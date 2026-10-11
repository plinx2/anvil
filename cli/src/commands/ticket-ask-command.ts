import { defineCommand } from 'citty';
import { type CliDeps, common, emit, guarded, toInt } from '../cli-deps';

/** anvil ticket ask — 承認待ちフラグを立てて質問する */
export const ticketAskCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'ask', description: '承認待ちフラグを立てて質問する' },
    args: {
      ticketId: { type: 'positional', required: true, description: 'チケットの番号' },
      question: { type: 'positional', required: true, description: '質問' },
      ...common,
    },
    run: ({ args }) =>
      guarded(deps, async () => {
        emit(deps, args, await deps.service.flags.ask(deps.ctx, { ticketId: toInt('ticketId', args.ticketId), question: args.question }));
      }),
  });
