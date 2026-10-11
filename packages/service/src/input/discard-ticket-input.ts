import { z } from 'zod';

/** チケットを破棄する */
export const DiscardTicketInputSchema = z.object({ ticketId: z.number().int() });
export type DiscardTicketInput = z.input<typeof DiscardTicketInputSchema>;
