import type { ListReflectionsOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';
import { ReflectionDtoSchema, toReflectionDto } from '../dto/reflection-dto';

export const ListReflectionsOutputSchema = z.object({
  reflections: z.array(ReflectionDtoSchema),
});
export type ListReflectionsOutput = z.infer<typeof ListReflectionsOutputSchema>;

export function toListReflectionsOutput(output: UseCaseOutput): ListReflectionsOutput {
  return { reflections: output.reflections.map(toReflectionDto) };
}
