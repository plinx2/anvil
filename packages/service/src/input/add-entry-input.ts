import { z } from 'zod';

export const AddEntryInputSchema = z.object({ ticketId: z.number().int(), body: z.string() });
export type AddEntryInput = z.input<typeof AddEntryInputSchema>;
