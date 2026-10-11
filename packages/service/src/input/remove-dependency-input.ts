import { z } from 'zod';

/** 依存を外す */
export const RemoveDependencyInputSchema = z.object({ ticketId: z.number().int(), dependsOnId: z.number().int() });
export type RemoveDependencyInput = z.input<typeof RemoveDependencyInputSchema>;
