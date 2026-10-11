import type { Entry } from '@anvil/entity';
import { z } from 'zod';
import { StateIdSchema } from './state-id';

export const EntryDtoSchema = z.object({
  id: z.number().int(),
  ticketId: z.number().int(),
  state: StateIdSchema,
  /** 書き手のロールの識別子。人間が書いたエントリは 'human' */
  role: z.string(),
  authorKind: z.enum(['human', 'agent']),
  body: z.string(),
  createdAt: z.string(),
});
export type EntryDto = z.infer<typeof EntryDtoSchema>;

export function toEntryDto(entry: Entry): EntryDto {
  return {
    id: entry.id,
    ticketId: entry.ticketId,
    state: entry.state.id,
    role: entry.role,
    authorKind: entry.authorKind,
    body: entry.body,
    createdAt: entry.createdAt,
  };
}
