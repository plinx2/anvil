import { defineCommand } from 'citty';
import { type CliDeps, common, emit, guarded, toInt } from '../cli-deps';

/** anvil ticket dependency remove — 依存を外す */
export const ticketDependencyRemoveCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'remove', description: '依存を外す' },
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
          await deps.service.tickets.removeDependency(deps.ctx, {
            ticketId: toInt('ticketId', args.ticketId),
            dependsOnId: toInt('dependsOnId', args.dependsOnId),
          }),
        );
      }),
  });
