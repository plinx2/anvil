import { z } from 'zod';

export const SetAutoGateInputSchema = z.object({ ticketId: z.number().int(), on: z.boolean() });
export type SetAutoGateInput = z.input<typeof SetAutoGateInputSchema>;
