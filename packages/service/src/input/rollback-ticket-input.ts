import { z } from 'zod';
import { StateIdSchema } from '../dto/state-id';

export const RollbackTicketInputSchema = z.object({
  ticketId: z.number().int(),
  /** 理由(必須。エントリに残る) */
  reason: z.string(),
  /** 省くと、カテゴリ内の最初の状態 */
  target: StateIdSchema.optional(),
});
export type RollbackTicketInput = z.input<typeof RollbackTicketInputSchema>;
