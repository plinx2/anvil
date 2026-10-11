import type { PassPreDoneGateOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';
import { TicketDtoSchema, toTicketDto } from '../dto/ticket-dto';

export const PassPreDoneGateOutputSchema = z.object({
  ticket: TicketDtoSchema,
});
export type PassPreDoneGateOutput = z.infer<typeof PassPreDoneGateOutputSchema>;

export function toPassPreDoneGateOutput(output: UseCaseOutput): PassPreDoneGateOutput {
  return { ticket: toTicketDto(output.ticket) };
}
