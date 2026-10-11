import { z } from 'zod';
import { ReflectionStatusSchema, ReflectionTargetSchema } from '../dto/reflection-dto';
import { RoleIdSchema } from '../dto/role-id';

export const ListReflectionsInputSchema = z.object({
  status: ReflectionStatusSchema.optional(),
  target: ReflectionTargetSchema.optional(),
  role: RoleIdSchema.optional(),
});
export type ListReflectionsInput = z.input<typeof ListReflectionsInputSchema>;
