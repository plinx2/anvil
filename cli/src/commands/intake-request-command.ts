import { AnvilError } from '@anvil/entity';
import type { RequestIntakeInput } from '@anvil/service';
import { defineCommand } from 'citty';
import { type CliDeps, common, emit, guarded, optInt, toBool } from '../cli-deps';

/** anvil intake request — 起票の依頼(分割・スパイクの元、またはプロジェクトを指定する) */
export const intakeRequestCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'request', description: '起票の依頼(分割・スパイクの元、またはプロジェクトを指定する)' },
    args: {
      ticket: { type: 'string', description: '元のチケットの番号(分割・スパイク)' },
      project: { type: 'string', description: 'プロジェクトの番号(元のチケットが無いとき)' },
      discard: { type: 'enum', options: ['true', 'false'], description: '全部起票された後に、元を破棄するか' },
      item: { type: 'string', description: 'やりたいこと(1 件。複数件は --items-json)' },
      'items-json': { type: 'string', description: '項目の JSON(kind、startState、slug、autoGate、dependsOn も指定するとき)' },
      ...common,
    },
    run: ({ args }) =>
      guarded(deps, async () => {
        if (args['items-json'] && args.item) throw AnvilError.invalid('--item と --items-json は同時に指定できない');
        const items: RequestIntakeInput['items'] = args['items-json']
          ? JSON.parse(args['items-json'])
          : args.item
            ? [{ wish: args.item }]
            : [];
        emit(
          deps,
          args,
          await deps.service.intakes.request(deps.ctx, {
            sourceTicketId: optInt('ticket', args.ticket),
            projectId: optInt('project', args.project),
            discard: toBool(args.discard),
            items,
          }),
        );
      }),
  });
