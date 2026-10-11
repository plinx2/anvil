import { defineCommand } from 'citty';
import { type CliDeps, common, emit, guarded } from '../cli-deps';

/** anvil project list — プロジェクトの一覧 */
export const projectListCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'list', description: 'プロジェクトの一覧' },
    args: {
      ...common,
    },
    run: ({ args }) =>
      guarded(deps, async () => {
        const data = await deps.service.projects.list(deps.ctx, {});
        if (data.projects.length === 0) return emit(deps, args, data, 'プロジェクトが無い');
        const text = data.projects
          .map(
            (p) =>
              `${p.id}\t${p.name}\tチケット ${p.tickets} 件(未完了 ${p.openTickets})\tリポジトリ: ${p.repos.map((r) => r.name).join(', ') || 'なし'}`,
          )
          .join('\n');
        emit(deps, args, data, text);
      }),
  });
