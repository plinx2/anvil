import type { UpdateRepoOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';
import { RepoDtoSchema, toRepoDto } from '../dto/repo-dto';

export const UpdateRepoOutputSchema = z.object({
  repos: z.array(RepoDtoSchema),
});
export type UpdateRepoOutput = z.infer<typeof UpdateRepoOutputSchema>;

export function toUpdateRepoOutput(output: UseCaseOutput): UpdateRepoOutput {
  return { repos: output.repos.map(toRepoDto) };
}
