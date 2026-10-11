import type { DecideReflectionOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';
import { ReflectionDtoSchema, toReflectionDto } from '../dto/reflection-dto';

export const DecideReflectionOutputSchema = z.object({
  reflection: ReflectionDtoSchema,
});
export type DecideReflectionOutput = z.infer<typeof DecideReflectionOutputSchema>;

export function toDecideReflectionOutput(output: UseCaseOutput): DecideReflectionOutput {
  return { reflection: toReflectionDto(output.reflection) };
}
