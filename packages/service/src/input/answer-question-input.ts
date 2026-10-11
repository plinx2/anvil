import { z } from 'zod';

export const AnswerQuestionInputSchema = z.object({
  ticketId: z.number().int(),
  answer: z.string(),
  /** 会話の中で、エージェントが代わりに書くとき(書き手は人間) */
  viaAgent: z.boolean().optional(),
});
export type AnswerQuestionInput = z.input<typeof AnswerQuestionInputSchema>;
