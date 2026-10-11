import { z } from 'zod';

/** ticketId は、dependsOnId が完了するまで着手できない */
export const AddDependencyInputSchema = z.object({ ticketId: z.number().int(), dependsOnId: z.number().int() });
export type AddDependencyInput = z.input<typeof AddDependencyInputSchema>;
