import { z } from 'zod';

/** エージェントのペインを開く */
export const FocusAgentInputSchema = z.object({ ticketId: z.number().int() });
export type FocusAgentInput = z.input<typeof FocusAgentInputSchema>;
