import type { TicketSummary } from '@anvil/usecase';
import { z } from 'zod';
import { CategoryIdSchema } from './category-id';
import { TicketDtoSchema, toTicketDto } from './ticket-dto';

/** チケットと、その周辺の情報(カンバン、詳細で使う)。 */
export const TicketSummaryDtoSchema = TicketDtoSchema.extend({
  project: z.string(),
  category: CategoryIdSchema,
  isGate: z.boolean(),
  /** 依存が解消した TODO(着手可) */
  ready: z.boolean(),
  /** 未完了の依存先 */
  unmet: z.array(z.number().int()),
  agentActive: z.boolean(),
  lastEntryAt: z.string(),
  entryCount: z.number().int(),
  rollbacks: z.number().int(),
});
export type TicketSummaryDto = z.infer<typeof TicketSummaryDtoSchema>;

export function toTicketSummaryDto(summary: TicketSummary): TicketSummaryDto {
  return {
    ...toTicketDto(summary.ticket),
    project: summary.projectName,
    category: summary.ticket.state.category.id,
    isGate: summary.ticket.isGate,
    ready: summary.ready,
    unmet: summary.unmetDependencyIds,
    agentActive: summary.agentActive,
    lastEntryAt: summary.lastEntryAt,
    entryCount: summary.entryCount,
    rollbacks: summary.rollbackCount,
  };
}
