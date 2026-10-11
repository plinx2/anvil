import type { Intake, IntakeItem } from '@anvil/entity';
import { z } from 'zod';
import { KindIdSchema } from './kind-id';
import { StateIdSchema } from './state-id';

export const IntakeDtoSchema = z.object({
  id: z.number().int(),
  projectId: z.number().int(),
  sourceTicketId: z.number().int().nullable(),
  discard: z.boolean(),
  status: z.enum(['open', 'done']),
  createdAt: z.string(),
});
export type IntakeDto = z.infer<typeof IntakeDtoSchema>;

export function toIntakeDto(intake: Intake): IntakeDto {
  return {
    id: intake.id,
    projectId: intake.projectId,
    sourceTicketId: intake.sourceTicketId,
    discard: intake.discard,
    status: intake.status,
    createdAt: intake.createdAt,
  };
}

export const IntakeItemDtoSchema = z.object({
  id: z.number().int(),
  intakeId: z.number().int(),
  seq: z.number().int(),
  wish: z.string(),
  kind: KindIdSchema,
  startState: StateIdSchema.nullable(),
  slug: z.string().nullable(),
  autoGate: z.boolean(),
  dependsOn: z.array(z.number().int()),
  ticketId: z.number().int().nullable(),
  status: z.enum(['pending', 'running', 'done']),
});
export type IntakeItemDto = z.infer<typeof IntakeItemDtoSchema>;

export function toIntakeItemDto(item: IntakeItem): IntakeItemDto {
  return {
    id: item.id,
    intakeId: item.intakeId,
    seq: item.seq,
    wish: item.wish,
    kind: item.kind.id,
    startState: item.startState?.id ?? null,
    slug: item.slug,
    autoGate: item.autoGate,
    dependsOn: [...item.dependsOn],
    ticketId: item.ticketId,
    status: item.status,
  };
}
