import { defineCommand } from 'citty';
import { type CliDeps, common, emit, guarded, toInt } from '../cli-deps';

/** anvil intake show — 起票の依頼の進み具合 */
export const intakeShowCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'show', description: '起票の依頼の進み具合' },
    args: {
      intakeId: { type: 'positional', required: true, description: '起票の依頼の番号' },
      ...common,
    },
    run: ({ args }) =>
      guarded(deps, async () => {
        emit(deps, args, await deps.service.intakes.progress(deps.ctx, { intakeId: toInt('intakeId', args.intakeId) }));
      }),
  });
