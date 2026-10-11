import type { AddDependencyOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';

export const AddDependencyOutputSchema = z.object({});
export type AddDependencyOutput = z.infer<typeof AddDependencyOutputSchema>;

export function toAddDependencyOutput(_output: UseCaseOutput): AddDependencyOutput {
  return {};
}
