import { defineCommand } from 'citty';
import { type CliDeps, common, emit, guarded, toInt } from '../cli-deps';

/** anvil repo add — プロジェクトにリポジトリを登録する */
export const repoAddCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'add', description: 'プロジェクトにリポジトリを登録する' },
    args: {
      projectId: { type: 'positional', required: true, description: 'プロジェクトの番号' },
      name: { type: 'positional', required: true, description: 'リポジトリの名前' },
      path: { type: 'positional', required: true, description: 'ローカルのパス' },
      branch: { type: 'string', description: 'デフォルトブランチ' },
      remote: { type: 'boolean', description: 'リモートがある' },
      ...common,
    },
    run: ({ args }) =>
      guarded(deps, async () => {
        const data = await deps.service.projects.addRepo(deps.ctx, {
          projectId: toInt('projectId', args.projectId),
          name: args.name,
          path: args.path,
          defaultBranch: args.branch,
          hasRemote: args.remote,
        });
        emit(deps, args, data, `リポジトリを登録した。プロジェクトのリポジトリ: ${data.repos.map((r) => r.name).join(', ')}`);
      }),
  });
