import type { History } from '@anvil/entity';
import { z } from 'zod';
import { RoleIdSchema } from './role-id';
import { StateIdSchema } from './state-id';

export const HistoryDtoSchema = z.object({
  id: z.number().int(),
  ticketId: z.number().int(),
  fromState: StateIdSchema.nullable(),
  toState: StateIdSchema,
  /** 誰が動かしたか。ロールのときだけ、role がある */
  actor: z.object({ kind: z.enum(['human', 'role', 'auto']), role: RoleIdSchema.nullable() }),
  createdAt: z.string(),
});
export type HistoryDto = z.infer<typeof HistoryDtoSchema>;

export function toHistoryDto(history: History): HistoryDto {
  return {
    id: history.id,
    ticketId: history.ticketId,
    fromState: history.fromState?.id ?? null,
    toState: history.toState.id,
    actor: { kind: history.actor.kind, role: history.actor.role?.id ?? null },
    createdAt: history.createdAt,
  };
}
