import type { StartAgentOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';
import { TicketDtoSchema, toTicketDto } from '../dto/ticket-dto';

export const StartAgentOutputSchema = z.object({
  ticket: TicketDtoSchema,
});
export type StartAgentOutput = z.infer<typeof StartAgentOutputSchema>;

export function toStartAgentOutput(output: UseCaseOutput): StartAgentOutput {
  return { ticket: toTicketDto(output.ticket) };
}
