import type { Dashboard } from '@anvil/usecase';
import { z } from 'zod';
import { StateIdSchema } from './state-id';

const DashboardTicketSchema = z.object({ id: z.number().int(), title: z.string(), project: z.string(), state: StateIdSchema });
const DoneCountSchema = z.object({ count: z.number().int(), lastYear: z.number().int() });

export const DashboardDtoSchema = z.object({
  awaiting: z.array(DashboardTicketSchema.extend({ since: z.string() })),
  working: z.array(DashboardTicketSchema),
  gates: z.array(DashboardTicketSchema.extend({ ready: z.boolean() })),
  doneWeek: DoneCountSchema,
  doneMonth: DoneCountSchema,
  recentProjects: z.array(z.object({ id: z.number().int(), name: z.string(), updatedAt: z.string() })),
  reflectionsPending: z.number().int(),
  problems: z.array(
    z.object({ id: z.number().int(), title: z.string(), prError: z.string().nullable(), launchError: z.string().nullable() }),
  ),
});
export type DashboardDto = z.infer<typeof DashboardDtoSchema>;

export function toDashboardDto(dashboard: Dashboard): DashboardDto {
  const ticket = (t: { id: number; title: string; project: string; state: { id: string } }) => ({
    id: t.id,
    title: t.title,
    project: t.project,
    state: t.state.id,
  });
  return {
    awaiting: dashboard.awaiting.map((t) => ({ ...ticket(t), since: t.since })),
    working: dashboard.working.map(ticket),
    gates: dashboard.gates.map((t) => ({ ...ticket(t), ready: t.ready })),
    doneWeek: dashboard.doneWeek,
    doneMonth: dashboard.doneMonth,
    recentProjects: dashboard.recentProjects,
    reflectionsPending: dashboard.reflectionsPending,
    problems: dashboard.problems,
  };
}
