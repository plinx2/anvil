import type { AddEntryOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';
import { EntryDtoSchema, toEntryDto } from '../dto/entry-dto';

export const AddEntryOutputSchema = z.object({
  entry: EntryDtoSchema,
});
export type AddEntryOutput = z.infer<typeof AddEntryOutputSchema>;

export function toAddEntryOutput(output: UseCaseOutput): AddEntryOutput {
  return { entry: toEntryDto(output.entry) };
}
