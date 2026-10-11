import type { AddRepoOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';
import { RepoDtoSchema, toRepoDto } from '../dto/repo-dto';

export const AddRepoOutputSchema = z.object({
  repos: z.array(RepoDtoSchema),
});
export type AddRepoOutput = z.infer<typeof AddRepoOutputSchema>;

export function toAddRepoOutput(output: UseCaseOutput): AddRepoOutput {
  return { repos: output.repos.map(toRepoDto) };
}
