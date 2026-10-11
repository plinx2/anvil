import type { RollbackTicketOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';
import { TicketDtoSchema, toTicketDto } from '../dto/ticket-dto';

export const RollbackTicketOutputSchema = z.object({
  ticket: TicketDtoSchema,
});
export type RollbackTicketOutput = z.infer<typeof RollbackTicketOutputSchema>;

export function toRollbackTicketOutput(output: UseCaseOutput): RollbackTicketOutput {
  return { ticket: toTicketDto(output.ticket) };
}
