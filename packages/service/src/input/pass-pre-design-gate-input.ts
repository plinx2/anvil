import { z } from 'zod';

export const PassPreDesignGateInputSchema = z.object({
  ticketId: z.number().int(),
  /** ストーリーポイント(必須) */
  sp: z.number(),
});
export type PassPreDesignGateInput = z.input<typeof PassPreDesignGateInputSchema>;
