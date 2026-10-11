import type { GetIntakeOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';
import { IntakeDtoSchema, IntakeItemDtoSchema, toIntakeDto, toIntakeItemDto } from '../dto/intake-dto';

export const GetIntakeOutputSchema = z.object({
  intake: IntakeDtoSchema,
  items: z.array(IntakeItemDtoSchema),
});
export type GetIntakeOutput = z.infer<typeof GetIntakeOutputSchema>;

export function toGetIntakeOutput(output: UseCaseOutput): GetIntakeOutput {
  return { intake: toIntakeDto(output.intake), items: output.items.map(toIntakeItemDto) };
}
