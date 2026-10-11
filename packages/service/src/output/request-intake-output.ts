import type { RequestIntakeOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';

export const RequestIntakeOutputSchema = z.object({
  intakeId: z.number().int(),
});
export type RequestIntakeOutput = z.infer<typeof RequestIntakeOutputSchema>;

export function toRequestIntakeOutput(output: UseCaseOutput): RequestIntakeOutput {
  return { intakeId: output.intakeId };
}
