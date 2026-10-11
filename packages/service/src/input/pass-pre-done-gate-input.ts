import { z } from 'zod';

/** 完了前ゲートを突破する */
export const PassPreDoneGateInputSchema = z.object({ ticketId: z.number().int() });
export type PassPreDoneGateInput = z.input<typeof PassPreDoneGateInputSchema>;
