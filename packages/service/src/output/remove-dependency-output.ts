import type { RemoveDependencyOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';

export const RemoveDependencyOutputSchema = z.object({});
export type RemoveDependencyOutput = z.infer<typeof RemoveDependencyOutputSchema>;

export function toRemoveDependencyOutput(_output: UseCaseOutput): RemoveDependencyOutput {
  return {};
}
