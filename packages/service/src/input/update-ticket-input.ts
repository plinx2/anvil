import { z } from 'zod';

export const UpdateTicketInputSchema = z.object({
  ticketId: z.number().int(),
  title: z.string().optional(),
  body: z.string().optional(),
  slug: z.string().optional(),
  designNeeded: z.boolean().optional(),
  targetRepos: z.array(z.string()).optional(),
});
export type UpdateTicketInput = z.input<typeof UpdateTicketInputSchema>;
