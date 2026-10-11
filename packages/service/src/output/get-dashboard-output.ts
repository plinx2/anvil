import type { GetDashboardOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';
import { DashboardDtoSchema, toDashboardDto } from '../dto/dashboard-dto';

export const GetDashboardOutputSchema = z.object({
  dashboard: DashboardDtoSchema,
});
export type GetDashboardOutput = z.infer<typeof GetDashboardOutputSchema>;

export function toGetDashboardOutput(output: UseCaseOutput): GetDashboardOutput {
  return { dashboard: toDashboardDto(output.dashboard) };
}
