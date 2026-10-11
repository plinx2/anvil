import { z } from 'zod';

export const UpdateRepoInputSchema = z.object({
  projectId: z.number().int(),
  name: z.string(),
  defaultBranch: z.string().optional(),
  hasRemote: z.boolean().optional(),
  path: z.string().optional(),
});
export type UpdateRepoInput = z.input<typeof UpdateRepoInputSchema>;
