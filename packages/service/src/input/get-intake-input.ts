import { z } from 'zod';

/** 起票の依頼の進み具合を読む */
export const GetIntakeInputSchema = z.object({ intakeId: z.number().int() });
export type GetIntakeInput = z.input<typeof GetIntakeInputSchema>;
