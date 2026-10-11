import { z } from 'zod';

/** 実装前ゲートを突破する */
export const PassPreImplGateInputSchema = z.object({ ticketId: z.number().int() });
export type PassPreImplGateInput = z.input<typeof PassPreImplGateInputSchema>;
