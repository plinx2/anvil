import type { CreateTicketInput } from '@anvil/service';
import { KindIdSchema, StateIdSchema } from '@anvil/service';
import { defineCommand } from 'citty';
import { type CliDeps, common, emit, guarded, many, manyInt, toBool, toInt } from '../cli-deps';

/** anvil ticket create — 起票する */
export const ticketCreateCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'create', description: '起票する' },
    args: {
      project: { type: 'string', description: 'プロジェクトの番号', required: true },
      title: { type: 'string', description: 'タイトル', required: true },
      body: { type: 'string', description: '内容' },
      slug: { type: 'string', description: 'slug(ブランチ名)' },
      kind: { type: 'enum', options: [...KindIdSchema.options], description: '種別' },
      state: { type: 'enum', options: [...StateIdSchema.options], description: '開始する状態(既定は TODO)' },
      'auto-gate': { type: 'boolean', description: '自動ゲート承認フラグを ON にする' },
      'design-needed': { type: 'enum', options: ['true', 'false'], description: 'デザインの要否' },
      'depends-on': { type: 'string', description: '依存先のチケットの番号(カンマ区切りで複数)' },
      repo: { type: 'string', description: '対象リポジトリ(カンマ区切りで複数)' },
      ...common,
    },
    run: ({ args }) =>
      guarded(deps, async () => {
        const data = await deps.service.tickets.create(deps.ctx, {
          projectId: toInt('project', args.project),
          title: args.title,
          body: args.body,
          slug: args.slug,
          kind: args.kind as CreateTicketInput['kind'],
          state: args.state as CreateTicketInput['state'],
          autoGate: args['auto-gate'] || undefined,
          designNeeded: toBool(args['design-needed']),
          dependsOn: manyInt('depends-on', args['depends-on']),
          targetRepos: many(args.repo),
        });
        emit(deps, args, data, `起票した: T-${data.ticket.id} ${data.ticket.title}(slug: ${data.ticket.slug})`);
      }),
  });
