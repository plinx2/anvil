import type { ProjectStore, RepoStore, TicketStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';
import type { ProjectSummary } from './project-summary';

export type ListProjectsInput = Record<string, never>;

export interface ListProjectsOutput {
  projects: ProjectSummary[];
}

/** プロジェクトの一覧(更新の新しい順。リポジトリ、チケットの数つき)。 */
export class ListProjects implements UseCase<ListProjectsInput, ListProjectsOutput> {
  constructor(
    private readonly projects: ProjectStore,
    private readonly repos: RepoStore,
    private readonly tickets: TicketStore,
  ) {}

  async execute(ctx: RequestContext, _input: ListProjectsInput): Promise<ListProjectsOutput> {
    const projects = await this.projects.list(ctx);
    const summaries = await Promise.all(
      projects.map(async (project) => {
        const tickets = await this.tickets.list(ctx, { projectId: project.id });
        return {
          project,
          repos: await this.repos.listByProject(ctx, project.id),
          ticketCount: tickets.length,
          openTicketCount: tickets.filter((t) => !t.isDone).length,
        };
      }),
    );
    return { projects: summaries };
  }
}
