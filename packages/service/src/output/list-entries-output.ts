import type { ListEntriesOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';
import { EntryDtoSchema, toEntryDto } from '../dto/entry-dto';

export const ListEntriesOutputSchema = z.object({
  total: z.number().int(),
  entries: z.array(EntryDtoSchema),
});
export type ListEntriesOutput = z.infer<typeof ListEntriesOutputSchema>;

export function toListEntriesOutput(output: UseCaseOutput): ListEntriesOutput {
  return { total: output.total, entries: output.entries.map(toEntryDto) };
}
