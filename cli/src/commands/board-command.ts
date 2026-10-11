import { State } from '@anvil/entity';
import { defineCommand } from 'citty';
import { type CliDeps, common, emit, guarded, optInt } from '../cli-deps';

/** anvil board — チケットの一覧(カンバン) */
export const boardCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'board', description: 'チケットの一覧(カンバン)' },
    args: {
      project: { type: 'string', description: 'プロジェクトの番号で絞る' },
      ...common,
    },
    run: ({ args }) =>
      guarded(deps, async () => {
        const data = await deps.service.tickets.board(deps.ctx, { projectId: optInt('project', args.project) });
        if (data.tickets.length === 0) return emit(deps, args, data, 'チケットが無い');
        const text = data.tickets
          .map((t) => {
            const flags = [t.awaiting ? '承認待ち' : '', t.ready ? '着手可' : '', t.agentActive ? '作業中' : ''].filter(Boolean).join(',');
            return `T-${t.id}\t${State.of(t.state).label}\t${t.title}\t${t.project}${flags ? `\t[${flags}]` : ''}`;
          })
          .join('\n');
        emit(deps, args, data, text);
      }),
  });
