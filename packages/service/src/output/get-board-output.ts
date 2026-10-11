import type { GetBoardOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';
import { TicketSummaryDtoSchema, toTicketSummaryDto } from '../dto/ticket-summary-dto';

export const GetBoardOutputSchema = z.object({
  tickets: z.array(TicketSummaryDtoSchema),
});
export type GetBoardOutput = z.infer<typeof GetBoardOutputSchema>;

export function toGetBoardOutput(output: UseCaseOutput): GetBoardOutput {
  return { tickets: output.tickets.map(toTicketSummaryDto) };
}
