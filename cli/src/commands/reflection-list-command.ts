import type { ListReflectionsInput } from '@anvil/service';
import { ReflectionStatusSchema, ReflectionTargetSchema, RoleIdSchema } from '@anvil/service';
import { defineCommand } from 'citty';
import { type CliDeps, common, emit, guarded } from '../cli-deps';

/** anvil reflection list — 振り返りの一覧(採否、改善の対象、ロールで絞れる) */
export const reflectionListCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'list', description: '振り返りの一覧(採否、改善の対象、ロールで絞れる)' },
    args: {
      status: { type: 'enum', options: [...ReflectionStatusSchema.options], description: '採否で絞る' },
      target: { type: 'enum', options: [...ReflectionTargetSchema.options], description: '改善の対象で絞る' },
      role: { type: 'enum', options: [...RoleIdSchema.options], description: 'ロールで絞る' },
      ...common,
    },
    run: ({ args }) =>
      guarded(deps, async () => {
        emit(
          deps,
          args,
          await deps.service.reflections.list(deps.ctx, {
            status: args.status as ListReflectionsInput['status'],
            target: args.target as ListReflectionsInput['target'],
            role: args.role as ListReflectionsInput['role'],
          }),
        );
      }),
  });
