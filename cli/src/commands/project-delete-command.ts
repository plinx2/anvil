import { defineCommand } from 'citty';
import { type CliDeps, common, emit, guarded, toInt } from '../cli-deps';

/** anvil project delete — プロジェクトを削除する(関わるデータをすべて消す。リポジトリとブランチは残す) */
export const projectDeleteCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'delete', description: 'プロジェクトを削除する(元に戻せない。リポジトリそのものとブランチは残す)' },
    args: {
      projectId: { type: 'positional', required: true, description: 'プロジェクトの番号' },
      'confirm-name': {
        type: 'string',
        required: true,
        description: 'プロジェクトの名前(取り違え防止。`-` で始まる名前は --confirm-name=<名前> と書く)',
      },
      ...common,
    },
    run: ({ args }) =>
      guarded(deps, async () => {
        const data = await deps.service.projects.delete(deps.ctx, {
          projectId: toInt('projectId', args.projectId),
          confirmName: args['confirm-name'],
        });
        emit(
          deps,
          args,
          data,
          `プロジェクトを削除した(チケット ${data.tickets} 件、リポジトリの登録 ${data.repos} 件、起票の依頼 ${data.intakes} 件)${
            data.keptBranches.length > 0 ? `\n残したブランチ: ${data.keptBranches.join(', ')}` : ''
          }`,
        );
      }),
  });
