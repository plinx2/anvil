import type { Project, Repo } from '@anvil/entity';

/** プロジェクト一覧に見せる形。 */
export interface ProjectSummary {
  project: Project;
  repos: Repo[];
  ticketCount: number;
  openTicketCount: number;
}
