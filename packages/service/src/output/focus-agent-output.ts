import type { FocusAgentOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';

export const FocusAgentOutputSchema = z.object({});
export type FocusAgentOutput = z.infer<typeof FocusAgentOutputSchema>;

export function toFocusAgentOutput(_output: UseCaseOutput): FocusAgentOutput {
  return {};
}
