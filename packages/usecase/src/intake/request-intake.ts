import { AnvilError, Kind, type State } from '@anvil/entity';
import type { FindProject } from '../find/find-project';
import type { FindTicket } from '../find/find-ticket';
import type { Clock, IntakeStore, TaskRunner } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';
import type { StartNextIntakeItem } from './start-next-intake-item';

export interface IntakeRequestItem {
  wish: string;
  kind?: Kind;
  startState?: State;
  slug?: string;
  autoGate?: boolean;
  dependsOn?: number[];
}

export interface RequestIntakeInput {
  /** 分割・スパイクの元のチケット。GUI の起票ボタンからの依頼には無い(その場合は、projectId が必要) */
  sourceTicketId?: number;
  projectId?: number;
  /** 全部起票された後に、元を破棄するか(既定: 元があれば破棄する)。しないなら、元が新しいチケットすべてに依存する(スパイク) */
  discard?: boolean;
  items: IntakeRequestItem[];
}

export interface RequestIntakeOutput {
  intakeId: number;
}

/**
 * 起票の依頼(分割・スパイク共通)。1 件ずつ順に、PBI 起票担当を起動して、起票させる。
 * 元のチケットがあるときは、DEV リファインまでのロール(AC 担当、実装方針担当)の、今の担当だけが依頼できる。
 */
export class RequestIntake implements UseCase<RequestIntakeInput, RequestIntakeOutput> {
  constructor(
    private readonly intakes: IntakeStore,
    private readonly tasks: TaskRunner,
    private readonly clock: Clock,
    private readonly findProject: FindProject,
    private readonly findTicket: FindTicket,
    private readonly startNextIntakeItem: StartNextIntakeItem,
  ) {}

  async execute(ctx: RequestContext, input: RequestIntakeInput): Promise<RequestIntakeOutput> {
    let projectId = input.projectId;
    if (input.sourceTicketId) {
      const { ticket: source } = await this.findTicket.execute(ctx, { ticketId: input.sourceTicketId });
      projectId = source.projectId;
      if (ctx.actor.isRole) {
        if (!ctx.actor.role?.canRequestIntake) throw AnvilError.forbidden('起票の依頼ができるのは、DEV リファインまでのロール');
        source.assertOperableBy(ctx.actor);
      }
    }
    if (!projectId) throw AnvilError.invalid('プロジェクトが必要');
    if (input.items.length === 0) throw AnvilError.invalid('依頼が空');
    const { project } = await this.findProject.execute(ctx, { projectId });

    const { intake } = await this.intakes.create(
      ctx,
      {
        projectId: project.id,
        sourceTicketId: input.sourceTicketId ?? null,
        discard: input.discard ?? input.sourceTicketId !== undefined,
        status: 'open',
        createdAt: this.clock.now(ctx),
      },
      input.items.map((item, seq) => ({
        intakeId: 0,
        seq,
        wish: item.wish,
        kind: item.kind ?? Kind.STANDARD,
        startState: item.startState ?? null,
        slug: item.slug ?? null,
        autoGate: item.autoGate ?? false,
        dependsOn: item.dependsOn ?? [],
        ticketId: null,
        status: 'pending' as const,
      })),
    );
    this.tasks.run(ctx, this.startNextIntakeItem.execute(ctx, { intakeId: intake.id }));
    return { intakeId: intake.id };
  }
}
