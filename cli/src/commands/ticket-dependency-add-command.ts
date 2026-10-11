import { defineCommand } from 'citty';
import { type CliDeps, common, emit, guarded, toInt } from '../cli-deps';

/** anvil ticket dependency add — 依存を足す(ticketId は、dependsOnId が完了するまで着手できない) */
export const ticketDependencyAddCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'add', description: '依存を足す(ticketId は、dependsOnId が完了するまで着手できない)' },
    args: {
      ticketId: { type: 'positional', required: true, description: 'チケットの番号' },
      dependsOnId: { type: 'positional', required: true, description: '依存先のチケットの番号' },
      ...common,
    },
    run: ({ args }) =>
      guarded(deps, async () => {
        emit(
          deps,
          args,
          await deps.service.tickets.addDependency(deps.ctx, {
            ticketId: toInt('ticketId', args.ticketId),
            dependsOnId: toInt('dependsOnId', args.dependsOnId),
          }),
        );
      }),
  });
