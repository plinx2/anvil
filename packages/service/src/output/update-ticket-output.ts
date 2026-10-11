import type { UpdateTicketOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';
import { TicketDtoSchema, toTicketDto } from '../dto/ticket-dto';

export const UpdateTicketOutputSchema = z.object({
  ticket: TicketDtoSchema,
});
export type UpdateTicketOutput = z.infer<typeof UpdateTicketOutputSchema>;

export function toUpdateTicketOutput(output: UseCaseOutput): UpdateTicketOutput {
  return { ticket: toTicketDto(output.ticket) };
}
