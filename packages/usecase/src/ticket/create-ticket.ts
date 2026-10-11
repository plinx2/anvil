import { Actor, AnvilError, Kind, Slug, State, type Ticket } from '@anvil/entity';
import type { AddDependency } from '../dependency/add-dependency';
import type { FindProject } from '../find/find-project';
import type { FindTicket } from '../find/find-ticket';
import type { OnTicketEntered } from '../flow/on-ticket-entered';
import type { PassPreImplGate } from '../flow/pass-pre-impl-gate';
import type { CompleteIntakeItem } from '../intake/complete-intake-item';
import type { ContinueIntake } from '../intake/continue-intake';
import type { Clock, HistoryStore, ProjectStore, RepoStore, TaskRunner, TicketStore, Transactor } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface CreateTicketInput {
  projectId: number;
  title: string;
  body?: string;
  /** 省くと標準 */
  kind?: Kind;
  /** 省くと TODO(スパイクは実装前ゲート)。TODO 以外で生まれたチケットは、その状態のエージェントを起動する */
  state?: State;
  slug?: string;
  autoGate?: boolean;
  designNeeded?: boolean;
  dependsOn?: number[];
  targetRepos?: string[];
  /** PBI 起票担当が、起票の依頼の項目に結びついて起票するとき */
  intakeItemId?: number;
}

export interface CreateTicketOutput {
  ticket: Ticket;
}

/** 起票。任意の状態で起票できる。 */
export class CreateTicket implements UseCase<CreateTicketInput, CreateTicketOutput> {
  constructor(
    private readonly projects: ProjectStore,
    private readonly repos: RepoStore,
    private readonly tickets: TicketStore,
    private readonly history: HistoryStore,
    private readonly transactor: Transactor,
    private readonly tasks: TaskRunner,
    private readonly clock: Clock,
    private readonly findProject: FindProject,
    private readonly findTicket: FindTicket,
    private readonly addDependency: AddDependency,
    private readonly completeIntakeItem: CompleteIntakeItem,
    private readonly continueIntake: ContinueIntake,
    private readonly onTicketEntered: OnTicketEntered,
    private readonly passPreImplGate: PassPreImplGate,
  ) {}

  async execute(ctx: RequestContext, input: CreateTicketInput): Promise<CreateTicketOutput> {
    if (!input.title.trim()) throw AnvilError.invalid('タイトルが空');
    const { project } = await this.findProject.execute(ctx, { projectId: input.projectId });
    const kind = input.kind ?? Kind.STANDARD;
    const state = input.state ?? State.initialStatesFor(kind)[0] ?? State.TODO;
    if (!State.initialStatesFor(kind).includes(state)) throw AnvilError.invalid(`この種別では、この状態で起票できない: ${state.label}`);

    const slug = await this.decideSlug(ctx, project.id, input);
    await this.assertRepos(ctx, project.id, input.targetRepos ?? []);
    for (const dependsOnId of input.dependsOn ?? []) await this.findTicket.execute(ctx, { ticketId: dependsOnId });

    const at = this.clock.now(ctx);
    const ticket = await this.transactor.transaction(ctx, async (tx) => {
      const created = await this.tickets.create(tx, {
        projectId: project.id,
        title: input.title,
        body: input.body ?? '',
        kind,
        state,
        awaiting: false,
        autoGate: input.autoGate ?? false,
        sp: null,
        designNeeded: kind.isSpike ? false : input.designNeeded !== false,
        slug,
        targetRepos: input.targetRepos ?? [],
        prUrls: {},
        prError: null,
        launchError: null,
        createdAt: at,
        updatedAt: at,
        doneAt: null,
      });
      await this.history.add(tx, { ticketId: created.id, fromState: null, toState: state, actor: ctx.actor, createdAt: at });
      for (const dependsOnId of input.dependsOn ?? []) await this.addDependency.execute(tx, { ticketId: created.id, dependsOnId });
      await this.projects.touch(tx, project.id, at);
      if (input.intakeItemId) await this.completeIntakeItem.execute(tx, { itemId: input.intakeItemId, ticketId: created.id });
      return created;
    });

    // エージェントの起動は遅いので、待たない(トランザクションの外で)
    if (input.intakeItemId) this.tasks.run(ctx, this.continueIntake.execute(ctx, { itemId: input.intakeItemId }));
    this.tasks.run(ctx, this.enter(ctx, ticket));
    return { ticket };
  }

  /** slug は、指定があれば検証し、無ければ、タイトルから(取れなければ番号で)決める。 */
  private async decideSlug(ctx: RequestContext, projectId: number, input: CreateTicketInput): Promise<string> {
    const given = input.slug?.trim();
    if (given) {
      if (!Slug.isValid(given)) throw AnvilError.invalid('slug に使えない文字がある');
      if (await this.tickets.findBySlug(ctx, projectId, given)) throw AnvilError.conflict(`slug が重複している: ${given}`);
      return given;
    }
    const base = Slug.candidateFrom(input.title) || `t-${await this.tickets.nextId(ctx)}`;
    let candidate = base;
    for (let n = 2; await this.tickets.findBySlug(ctx, projectId, candidate); n++) candidate = `${base}-${n}`;
    return candidate;
  }

  private async assertRepos(ctx: RequestContext, projectId: number, names: string[]): Promise<void> {
    const known = new Set((await this.repos.listByProject(ctx, projectId)).map((r) => r.name));
    for (const name of names) if (!known.has(name)) throw AnvilError.invalid(`リポジトリが無い: ${name}`);
  }

  /** 新しい状態の後始末。実装前ゲートで生まれて、自動ゲート承認が ON なら、突破する。 */
  private async enter(ctx: RequestContext, ticket: Ticket): Promise<void> {
    await this.onTicketEntered.execute(ctx, { ticket });
    if (ticket.state === State.PRE_IMPL_GATE && ticket.autoGate) {
      await this.passPreImplGate.execute(ctx.withActor(Actor.auto()), { ticketId: ticket.id });
    }
  }
}
