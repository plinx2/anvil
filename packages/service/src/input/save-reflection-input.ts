import { z } from 'zod';
import { ReflectionTargetSchema } from '../dto/reflection-dto';
import { StateIdSchema } from '../dto/state-id';

export const SaveReflectionInputSchema = z.object({
  ticketId: z.number().int().optional(),
  state: StateIdSchema.optional(),
  good: z.string().optional(),
  trouble: z.string().optional(),
  hypothesis: z.string().optional(),
  proposal: z.string().optional(),
  target: ReflectionTargetSchema.optional(),
  evidence: z.string().optional(),
});
export type SaveReflectionInput = z.input<typeof SaveReflectionInputSchema>;
