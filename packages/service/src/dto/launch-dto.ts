import type { Launch } from '@anvil/entity';
import { z } from 'zod';
import { RoleIdSchema } from './role-id';
import { StateIdSchema } from './state-id';

export const LaunchDtoSchema = z.object({
  id: z.number().int(),
  ticketId: z.number().int().nullable(),
  intakeItemId: z.number().int().nullable(),
  state: StateIdSchema.nullable(),
  role: RoleIdSchema,
  name: z.string(),
  sessionId: z.string(),
  startedAt: z.string(),
  endedAt: z.string().nullable(),
});
export type LaunchDto = z.infer<typeof LaunchDtoSchema>;

export function toLaunchDto(launch: Launch): LaunchDto {
  return {
    id: launch.id,
    ticketId: launch.ticketId,
    intakeItemId: launch.intakeItemId,
    state: launch.state?.id ?? null,
    role: launch.role.id,
    name: launch.name,
    sessionId: launch.sessionId,
    startedAt: launch.startedAt,
    endedAt: launch.endedAt,
  };
}
