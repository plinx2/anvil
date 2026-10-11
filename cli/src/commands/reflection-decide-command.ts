import type { DecideReflectionInput } from '@anvil/service';
import { defineCommand } from 'citty';
import { type CliDeps, common, emit, guarded, toInt } from '../cli-deps';

/** anvil reflection decide — 振り返りの採否を決める */
export const reflectionDecideCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'decide', description: '振り返りの採否を決める' },
    args: {
      reflectionId: { type: 'positional', required: true, description: '振り返りの番号' },
      status: { type: 'positional', required: true, description: 'pending / adopted / rejected' },
      reason: { type: 'string', description: '却下の理由' },
      ...common,
    },
    run: ({ args }) =>
      guarded(deps, async () => {
        emit(
          deps,
          args,
          await deps.service.reflections.decide(deps.ctx, {
            reflectionId: toInt('reflectionId', args.reflectionId),
            status: args.status as DecideReflectionInput['status'],
            reason: args.reason,
          }),
        );
      }),
  });
