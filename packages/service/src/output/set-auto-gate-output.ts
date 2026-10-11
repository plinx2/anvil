import type { SetAutoGateOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';
import { TicketDtoSchema, toTicketDto } from '../dto/ticket-dto';

export const SetAutoGateOutputSchema = z.object({
  ticket: TicketDtoSchema,
});
export type SetAutoGateOutput = z.infer<typeof SetAutoGateOutputSchema>;

export function toSetAutoGateOutput(output: UseCaseOutput): SetAutoGateOutput {
  return { ticket: toTicketDto(output.ticket) };
}
