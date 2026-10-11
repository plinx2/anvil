import type { PassPreImplGateOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';
import { TicketDtoSchema, toTicketDto } from '../dto/ticket-dto';

export const PassPreImplGateOutputSchema = z.object({
  ticket: TicketDtoSchema,
});
export type PassPreImplGateOutput = z.infer<typeof PassPreImplGateOutputSchema>;

export function toPassPreImplGateOutput(output: UseCaseOutput): PassPreImplGateOutput {
  return { ticket: toTicketDto(output.ticket) };
}
