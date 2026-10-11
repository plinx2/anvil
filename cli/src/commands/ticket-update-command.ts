import { defineCommand } from 'citty';
import { type CliDeps, common, emit, guarded, many, toBool, toInt } from '../cli-deps';

/** anvil ticket update — タイトル、内容、slug、デザインの要否、対象リポジトリを更新する */
export const ticketUpdateCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'update', description: 'タイトル、内容、slug、デザインの要否、対象リポジトリを更新する' },
    args: {
      ticketId: { type: 'positional', required: true, description: 'チケットの番号' },
      title: { type: 'string', description: 'タイトル' },
      body: { type: 'string', description: '内容' },
      slug: { type: 'string', description: 'slug(ブランチを切る前だけ)' },
      'design-needed': { type: 'enum', options: ['true', 'false'], description: 'デザインの要否' },
      repo: { type: 'string', description: '対象リポジトリ(カンマ区切りで複数)' },
      ...common,
    },
    run: ({ args }) =>
      guarded(deps, async () => {
        const data = await deps.service.tickets.update(deps.ctx, {
          ticketId: toInt('ticketId', args.ticketId),
          title: args.title,
          body: args.body,
          slug: args.slug,
          designNeeded: toBool(args['design-needed']),
          targetRepos: many(args.repo),
        });
        emit(deps, args, data);
      }),
  });
