import type { Repo } from '@anvil/entity';
import { z } from 'zod';

export const RepoDtoSchema = z.object({
  id: z.number().int(),
  projectId: z.number().int(),
  name: z.string(),
  path: z.string(),
  defaultBranch: z.string(),
  hasRemote: z.boolean(),
});
export type RepoDto = z.infer<typeof RepoDtoSchema>;

export function toRepoDto(repo: Repo): RepoDto {
  return {
    id: repo.id,
    projectId: repo.projectId,
    name: repo.name,
    path: repo.path,
    defaultBranch: repo.defaultBranch,
    hasRemote: repo.hasRemote,
  };
}
