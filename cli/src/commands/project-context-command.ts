import { defineCommand } from 'citty';
import { type CliDeps, common, emit, guarded, toInt } from '../cli-deps';

/** anvil project context — プロジェクトコンテキストのページを読む */
export const projectContextCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'context', description: 'プロジェクトコンテキストのページを読む' },
    args: {
      projectId: { type: 'positional', required: true, description: 'プロジェクトの番号' },
      ...common,
    },
    run: ({ args }) =>
      guarded(deps, async () => {
        emit(deps, args, await deps.service.projects.contextPages(deps.ctx, { projectId: toInt('projectId', args.projectId) }));
      }),
  });
