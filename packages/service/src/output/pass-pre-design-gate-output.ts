import type { PassPreDesignGateOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';
import { TicketDtoSchema, toTicketDto } from '../dto/ticket-dto';

export const PassPreDesignGateOutputSchema = z.object({
  ticket: TicketDtoSchema,
});
export type PassPreDesignGateOutput = z.infer<typeof PassPreDesignGateOutputSchema>;

export function toPassPreDesignGateOutput(output: UseCaseOutput): PassPreDesignGateOutput {
  return { ticket: toTicketDto(output.ticket) };
}
