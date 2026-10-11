import type { ListProjectsOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';
import { ProjectSummaryDtoSchema, toProjectSummaryDto } from '../dto/project-summary-dto';

export const ListProjectsOutputSchema = z.object({
  projects: z.array(ProjectSummaryDtoSchema),
});
export type ListProjectsOutput = z.infer<typeof ListProjectsOutputSchema>;

export function toListProjectsOutput(output: UseCaseOutput): ListProjectsOutput {
  return { projects: output.projects.map(toProjectSummaryDto) };
}
