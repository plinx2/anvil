import { defineCommand } from 'citty';
import { type CliDeps, common, emit, guarded } from '../cli-deps';

/** anvil project create — プロジェクトを登録する */
export const projectCreateCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'create', description: 'プロジェクトを登録する' },
    args: {
      name: { type: 'positional', required: true, description: 'プロジェクト名' },
      ...common,
    },
    run: ({ args }) =>
      guarded(deps, async () => {
        const data = await deps.service.projects.create(deps.ctx, { name: args.name });
        emit(deps, args, data, `プロジェクトを登録した: ${data.project.id} ${data.project.name}`);
      }),
  });
