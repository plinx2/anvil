import type { AdvanceTicketOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';
import { TicketDtoSchema, toTicketDto } from '../dto/ticket-dto';

export const AdvanceTicketOutputSchema = z.object({
  ticket: TicketDtoSchema,
});
export type AdvanceTicketOutput = z.infer<typeof AdvanceTicketOutputSchema>;

export function toAdvanceTicketOutput(output: UseCaseOutput): AdvanceTicketOutput {
  return { ticket: toTicketDto(output.ticket) };
}
