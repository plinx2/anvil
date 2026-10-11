import { z } from 'zod';
import { ReflectionStatusSchema } from '../dto/reflection-dto';

export const DecideReflectionInputSchema = z.object({
  reflectionId: z.number().int(),
  status: ReflectionStatusSchema,
  /** 却下の理由(任意) */
  reason: z.string().optional(),
});
export type DecideReflectionInput = z.input<typeof DecideReflectionInputSchema>;
