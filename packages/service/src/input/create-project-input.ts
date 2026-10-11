import { z } from 'zod';

export const CreateProjectInputSchema = z.object({ name: z.string() });
export type CreateProjectInput = z.input<typeof CreateProjectInputSchema>;
