import type { GetTicketDetailOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';
import { TicketDetailDtoSchema, toTicketDetailDto } from '../dto/ticket-detail-dto';

export const GetTicketDetailOutputSchema = z.object({
  detail: TicketDetailDtoSchema,
});
export type GetTicketDetailOutput = z.infer<typeof GetTicketDetailOutputSchema>;

export function toGetTicketDetailOutput(output: UseCaseOutput): GetTicketDetailOutput {
  return { detail: toTicketDetailDto(output.detail) };
}
