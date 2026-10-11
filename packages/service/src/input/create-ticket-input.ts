import { z } from 'zod';
import { KindIdSchema } from '../dto/kind-id';
import { StateIdSchema } from '../dto/state-id';

export const CreateTicketInputSchema = z.object({
  projectId: z.number().int(),
  title: z.string(),
  body: z.string().optional(),
  kind: KindIdSchema.optional(),
  state: StateIdSchema.optional(),
  slug: z.string().optional(),
  autoGate: z.boolean().optional(),
  designNeeded: z.boolean().optional(),
  dependsOn: z.array(z.number().int()).optional(),
  targetRepos: z.array(z.string()).optional(),
  /** PBI 起票担当が、起票の依頼の項目に結びついて起票するとき */
  intakeItemId: z.number().int().optional(),
});
export type CreateTicketInput = z.input<typeof CreateTicketInputSchema>;
