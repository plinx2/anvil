import { z } from 'zod';

export const AskQuestionInputSchema = z.object({ ticketId: z.number().int(), question: z.string() });
export type AskQuestionInput = z.input<typeof AskQuestionInputSchema>;
