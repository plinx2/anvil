import type { ProjectSummary } from '@anvil/usecase';
import { z } from 'zod';
import { ProjectDtoSchema, toProjectDto } from './project-dto';
import { RepoDtoSchema, toRepoDto } from './repo-dto';

/** プロジェクト一覧に見せる形(リポジトリと、チケットの数つき)。 */
export const ProjectSummaryDtoSchema = ProjectDtoSchema.extend({
  repos: z.array(RepoDtoSchema),
  tickets: z.number().int(),
  openTickets: z.number().int(),
});
export type ProjectSummaryDto = z.infer<typeof ProjectSummaryDtoSchema>;

export function toProjectSummaryDto(summary: ProjectSummary): ProjectSummaryDto {
  return {
    ...toProjectDto(summary.project),
    repos: summary.repos.map(toRepoDto),
    tickets: summary.ticketCount,
    openTickets: summary.openTicketCount,
  };
}
