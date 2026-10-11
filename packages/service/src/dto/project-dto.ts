import type { Project } from '@anvil/entity';
import { z } from 'zod';

export const ProjectDtoSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ProjectDto = z.infer<typeof ProjectDtoSchema>;

export function toProjectDto(project: Project): ProjectDto {
  return { id: project.id, name: project.name, createdAt: project.createdAt, updatedAt: project.updatedAt };
}
