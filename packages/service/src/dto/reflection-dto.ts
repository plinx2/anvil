import type { Reflection } from '@anvil/entity';
import { z } from 'zod';
import { RoleIdSchema } from './role-id';
import { StateIdSchema } from './state-id';

export const ReflectionTargetSchema = z.enum(['role', 'anvil', 'skill', 'project_doc']);
export const ReflectionStatusSchema = z.enum(['pending', 'adopted', 'rejected']);

export const ReflectionDtoSchema = z.object({
  id: z.number().int(),
  ticketId: z.number().int().nullable(),
  role: RoleIdSchema,
  state: StateIdSchema.nullable(),
  sessionId: z.string().nullable(),
  good: z.string(),
  trouble: z.string(),
  hypothesis: z.string(),
  proposal: z.string(),
  target: ReflectionTargetSchema,
  evidence: z.string(),
  status: ReflectionStatusSchema,
  rejectReason: z.string().nullable(),
  createdAt: z.string(),
  decidedAt: z.string().nullable(),
});
export type ReflectionDto = z.infer<typeof ReflectionDtoSchema>;

export function toReflectionDto(reflection: Reflection): ReflectionDto {
  return {
    id: reflection.id,
    ticketId: reflection.ticketId,
    role: reflection.role.id,
    state: reflection.state?.id ?? null,
    sessionId: reflection.sessionId,
    good: reflection.good,
    trouble: reflection.trouble,
    hypothesis: reflection.hypothesis,
    proposal: reflection.proposal,
    target: reflection.target,
    evidence: reflection.evidence,
    status: reflection.status,
    rejectReason: reflection.rejectReason,
    createdAt: reflection.createdAt,
    decidedAt: reflection.decidedAt,
  };
}
