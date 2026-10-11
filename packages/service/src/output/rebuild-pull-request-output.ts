import type { RebuildPullRequestOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';
import { TicketDtoSchema, toTicketDto } from '../dto/ticket-dto';

export const RebuildPullRequestOutputSchema = z.object({
  ticket: TicketDtoSchema,
});
export type RebuildPullRequestOutput = z.infer<typeof RebuildPullRequestOutputSchema>;

export function toRebuildPullRequestOutput(output: UseCaseOutput): RebuildPullRequestOutput {
  return { ticket: toTicketDto(output.ticket) };
}
