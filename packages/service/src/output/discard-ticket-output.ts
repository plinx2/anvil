import type { DiscardTicketOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';

export const DiscardTicketOutputSchema = z.object({
  keptBranches: z.array(z.string()),
});
export type DiscardTicketOutput = z.infer<typeof DiscardTicketOutputSchema>;

export function toDiscardTicketOutput(output: UseCaseOutput): DiscardTicketOutput {
  return { keptBranches: [...output.keptBranches] };
}
