import type { StartTicketOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';
import { TicketDtoSchema, toTicketDto } from '../dto/ticket-dto';

export const StartTicketOutputSchema = z.object({
  ticket: TicketDtoSchema,
});
export type StartTicketOutput = z.infer<typeof StartTicketOutputSchema>;

export function toStartTicketOutput(output: UseCaseOutput): StartTicketOutput {
  return { ticket: toTicketDto(output.ticket) };
}
