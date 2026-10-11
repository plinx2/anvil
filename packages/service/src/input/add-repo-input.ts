import { z } from 'zod';

export const AddRepoInputSchema = z.object({
  projectId: z.number().int(),
  name: z.string(),
  path: z.string(),
  defaultBranch: z.string().optional(),
  hasRemote: z.boolean().optional(),
});
export type AddRepoInput = z.input<typeof AddRepoInputSchema>;
