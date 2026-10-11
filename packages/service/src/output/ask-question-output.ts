import type { AskQuestionOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';
import { TicketDtoSchema, toTicketDto } from '../dto/ticket-dto';

export const AskQuestionOutputSchema = z.object({
  ticket: TicketDtoSchema,
});
export type AskQuestionOutput = z.infer<typeof AskQuestionOutputSchema>;

export function toAskQuestionOutput(output: UseCaseOutput): AskQuestionOutput {
  return { ticket: toTicketDto(output.ticket) };
}
