import type { SaveReflectionOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';
import { ReflectionDtoSchema, toReflectionDto } from '../dto/reflection-dto';

export const SaveReflectionOutputSchema = z.object({
  reflection: ReflectionDtoSchema,
});
export type SaveReflectionOutput = z.infer<typeof SaveReflectionOutputSchema>;

export function toSaveReflectionOutput(output: UseCaseOutput): SaveReflectionOutput {
  return { reflection: toReflectionDto(output.reflection) };
}
