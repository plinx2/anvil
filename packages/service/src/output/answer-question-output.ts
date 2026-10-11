import type { AnswerQuestionOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';
import { TicketDtoSchema, toTicketDto } from '../dto/ticket-dto';

export const AnswerQuestionOutputSchema = z.object({
  ticket: TicketDtoSchema,
});
export type AnswerQuestionOutput = z.infer<typeof AnswerQuestionOutputSchema>;

export function toAnswerQuestionOutput(output: UseCaseOutput): AnswerQuestionOutput {
  return { ticket: toTicketDto(output.ticket) };
}
