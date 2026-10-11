import { z } from 'zod';
import { StateIdSchema } from '../dto/state-id';

export const ListEntriesInputSchema = z.object({
  ticketId: z.number().int(),
  /** 状態で絞る */
  state: StateIdSchema.optional(),
  /** 直近の件数 */
  limit: z.number().int().optional(),
});
export type ListEntriesInput = z.input<typeof ListEntriesInputSchema>;
