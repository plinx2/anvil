import type { Clock, ProjectStore, ReflectionStore, TicketStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';
import type { Dashboard, DashboardTicket, DoneCount } from './dashboard';
import type { GetBoard } from './get-board';
import type { TicketSummary } from './ticket-summary';

const DAY_MS = 86_400_000;

export type GetDashboardInput = Record<string, never>;

export interface GetDashboardOutput {
  dashboard: Dashboard;
}

/** ダッシュボード(承認待ち、作業中、ゲート、完了数と昨対、最近のプロジェクト、振り返り、要対応)。 */
export class GetDashboard implements UseCase<GetDashboardInput, GetDashboardOutput> {
  constructor(
    private readonly tickets: TicketStore,
    private readonly projects: ProjectStore,
    private readonly reflections: ReflectionStore,
    private readonly clock: Clock,
    private readonly getBoard: GetBoard,
  ) {}

  async execute(ctx: RequestContext, _input: GetDashboardInput): Promise<GetDashboardOutput> {
    const { tickets: board } = await this.getBoard.execute(ctx, {});
    const brief = (s: TicketSummary): DashboardTicket => ({
      id: s.ticket.id,
      title: s.ticket.title,
      project: s.projectName,
      state: s.ticket.state,
    });

    const dashboard: Dashboard = {
      awaiting: board
        .filter((s) => s.ticket.awaiting)
        .sort((a, b) => a.lastEntryAt.localeCompare(b.lastEntryAt))
        .map((s) => ({ ...brief(s), since: s.lastEntryAt })),
      working: board.filter((s) => s.ticket.hasAgent && !s.ticket.awaiting && s.agentActive).map(brief),
      gates: board.filter((s) => s.ticket.isGate).map((s) => ({ ...brief(s), ready: s.ready })),
      doneWeek: await this.doneCount(ctx, 7),
      doneMonth: await this.doneCount(ctx, 30),
      recentProjects: (await this.projects.list(ctx)).slice(0, 5).map(({ id, name, updatedAt }) => ({ id, name, updatedAt })),
      reflectionsPending: await this.reflections.countPending(ctx),
      problems: board
        .filter((s) => s.ticket.prError || s.ticket.launchError)
        .map((s) => ({ id: s.ticket.id, title: s.ticket.title, prError: s.ticket.prError, launchError: s.ticket.launchError })),
    };
    return { dashboard };
  }

  /** 過去 days 日の完了数と、1 年前の同じ期間の完了数 */
  private async doneCount(ctx: RequestContext, days: number): Promise<DoneCount> {
    const now = this.clock.date(ctx);
    const from = new Date(now.getTime() - days * DAY_MS);
    const yearAgo = (d: Date) => new Date(new Date(d).setFullYear(d.getFullYear() - 1));
    return {
      count: await this.tickets.countDone(ctx, from.toISOString(), new Date(now.getTime() + 1000).toISOString()),
      lastYear: await this.tickets.countDone(ctx, yearAgo(from).toISOString(), yearAgo(now).toISOString()),
    };
  }
}
