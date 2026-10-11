import { z } from 'zod';

export const AdvanceTicketInputSchema = z.object({
  ticketId: z.number().int(),
  /** 次のロールへの申し送り */
  handoff: z.string().optional(),
});
export type AdvanceTicketInput = z.input<typeof AdvanceTicketInputSchema>;
