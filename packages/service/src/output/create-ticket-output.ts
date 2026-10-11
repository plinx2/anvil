import type { CreateTicketOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';
import { TicketDtoSchema, toTicketDto } from '../dto/ticket-dto';

export const CreateTicketOutputSchema = z.object({
  ticket: TicketDtoSchema,
});
export type CreateTicketOutput = z.infer<typeof CreateTicketOutputSchema>;

export function toCreateTicketOutput(output: UseCaseOutput): CreateTicketOutput {
  return { ticket: toTicketDto(output.ticket) };
}
