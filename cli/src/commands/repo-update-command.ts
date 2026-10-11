import { defineCommand } from 'citty';
import { type CliDeps, common, emit, guarded, toInt } from '../cli-deps';

/** anvil repo update — 登録済みリポジトリの設定を更新する(指定した項目だけ) */
export const repoUpdateCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'update', description: '登録済みリポジトリの設定を更新する(指定した項目だけ。名前は変えられない)' },
    args: {
      projectId: { type: 'positional', required: true, description: 'プロジェクトの番号' },
      name: { type: 'positional', required: true, description: 'リポジトリの名前' },
      path: { type: 'string', description: 'ローカルのパス' },
      branch: { type: 'string', description: 'デフォルトブランチ' },
      remote: { type: 'boolean', description: 'リモートがある(--no-remote で、ない)' },
      ...common,
    },
    run: ({ args }) =>
      guarded(deps, async () => {
        const data = await deps.service.projects.updateRepo(deps.ctx, {
          projectId: toInt('projectId', args.projectId),
          name: args.name,
          path: args.path,
          defaultBranch: args.branch,
          hasRemote: args.remote,
        });
        emit(deps, args, data, `リポジトリを更新した。プロジェクトのリポジトリ: ${data.repos.map((r) => r.name).join(', ')}`);
      }),
  });
