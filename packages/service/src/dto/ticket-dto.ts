import type { Ticket } from '@anvil/entity';
import { z } from 'zod';
import { KindIdSchema } from './kind-id';
import { StateIdSchema } from './state-id';

export const TicketDtoSchema = z.object({
  id: z.number().int(),
  projectId: z.number().int(),
  title: z.string(),
  body: z.string(),
  kind: KindIdSchema,
  state: StateIdSchema,
  awaiting: z.boolean(),
  autoGate: z.boolean(),
  sp: z.number().nullable(),
  designNeeded: z.boolean(),
  slug: z.string(),
  targetRepos: z.array(z.string()),
  prUrls: z.record(z.string(), z.string()),
  prError: z.string().nullable(),
  launchError: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  doneAt: z.string().nullable(),
});
export type TicketDto = z.infer<typeof TicketDtoSchema>;

export function toTicketDto(ticket: Ticket): TicketDto {
  return {
    id: ticket.id,
    projectId: ticket.projectId,
    title: ticket.title,
    body: ticket.body,
    kind: ticket.kind.id,
    state: ticket.state.id,
    awaiting: ticket.awaiting,
    autoGate: ticket.autoGate,
    sp: ticket.sp,
    designNeeded: ticket.designNeeded,
    slug: ticket.slug,
    targetRepos: [...ticket.targetRepos],
    prUrls: { ...ticket.prUrls },
    prError: ticket.prError,
    launchError: ticket.launchError,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    doneAt: ticket.doneAt,
  };
}
