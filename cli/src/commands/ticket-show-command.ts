import { State } from '@anvil/entity';
import { defineCommand } from 'citty';
import { type CliDeps, common, emit, guarded, toInt } from '../cli-deps';

/** anvil ticket show — チケットの詳細 */
export const ticketShowCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'show', description: 'チケットの詳細' },
    args: {
      ticketId: { type: 'positional', required: true, description: 'チケットの番号' },
      ...common,
    },
    run: ({ args }) =>
      guarded(deps, async () => {
        const data = await deps.service.tickets.detail(deps.ctx, { ticketId: toInt('ticketId', args.ticketId) });
        const { detail } = data;
        const t = detail.ticket;
        const lines = [
          `T-${t.id} ${t.title}`,
          `状態: ${State.of(t.state).label}${t.awaiting ? '(承認待ち)' : ''}  種別: ${t.kind}  SP: ${t.sp ?? '未設定'}  slug: ${t.slug}`,
          `対象リポジトリ: ${t.targetRepos.join(', ') || '未設定'}  ブランチ: ${detail.branches.map((b) => `${b.repoName}:${b.branch}`).join(', ') || 'まだ切っていない'}`,
          '',
          t.body || '(内容なし)',
          '',
          `エントリ(${detail.entries.length} 件):`,
          ...detail.entries.slice(-3).map((e) => `  [${State.of(e.state).label} / ${e.role}] ${e.body.split('\n')[0]}`),
        ];
        emit(deps, args, data, lines.join('\n'));
      }),
  });
