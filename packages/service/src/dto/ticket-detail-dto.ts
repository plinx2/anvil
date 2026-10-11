import type { TicketDetail } from '@anvil/usecase';
import { z } from 'zod';
import { BranchDtoSchema, toBranchDto } from './branch-dto';
import { EntryDtoSchema, toEntryDto } from './entry-dto';
import { HistoryDtoSchema, toHistoryDto } from './history-dto';
import { LaunchDtoSchema, toLaunchDto } from './launch-dto';
import { TicketRefDtoSchema, toTicketRefDto } from './ticket-ref-dto';
import { TicketSummaryDtoSchema, toTicketSummaryDto } from './ticket-summary-dto';

export const TicketDetailDtoSchema = z.object({
  ticket: TicketSummaryDtoSchema,
  entries: z.array(EntryDtoSchema),
  dependsOn: z.array(TicketRefDtoSchema),
  dependents: z.array(TicketRefDtoSchema),
  launches: z.array(LaunchDtoSchema),
  history: z.array(HistoryDtoSchema),
  branches: z.array(BranchDtoSchema),
});
export type TicketDetailDto = z.infer<typeof TicketDetailDtoSchema>;

export function toTicketDetailDto(detail: TicketDetail): TicketDetailDto {
  return {
    ticket: toTicketSummaryDto(detail.summary),
    entries: detail.entries.map(toEntryDto),
    dependsOn: detail.dependsOn.map(toTicketRefDto),
    dependents: detail.dependents.map(toTicketRefDto),
    launches: detail.launches.map(toLaunchDto),
    history: detail.history.map(toHistoryDto),
    branches: detail.branches.map(toBranchDto),
  };
}
