import type { CreateProjectOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';
import { ProjectDtoSchema, toProjectDto } from '../dto/project-dto';

export const CreateProjectOutputSchema = z.object({
  project: ProjectDtoSchema,
});
export type CreateProjectOutput = z.infer<typeof CreateProjectOutputSchema>;

export function toCreateProjectOutput(output: UseCaseOutput): CreateProjectOutput {
  return { project: toProjectDto(output.project) };
}
