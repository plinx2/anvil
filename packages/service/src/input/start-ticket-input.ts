import { z } from 'zod';

/** チケットを着手する(TODO → リファイン) */
export const StartTicketInputSchema = z.object({ ticketId: z.number().int() });
export type StartTicketInput = z.input<typeof StartTicketInputSchema>;
