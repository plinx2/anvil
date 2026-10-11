import type { GetContextPagesOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';
import { ContextPageDtoSchema, toContextPageDto } from '../dto/context-page-dto';

export const GetContextPagesOutputSchema = z.object({
  pages: z.array(ContextPageDtoSchema),
});
export type GetContextPagesOutput = z.infer<typeof GetContextPagesOutputSchema>;

export function toGetContextPagesOutput(output: UseCaseOutput): GetContextPagesOutput {
  return { pages: output.pages.map(toContextPageDto) };
}
