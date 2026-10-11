import type { Branch } from '@anvil/entity';
import { z } from 'zod';

export const BranchDtoSchema = z.object({
  ticketId: z.number().int(),
  repoName: z.string(),
  branch: z.string(),
  worktreePath: z.string(),
});
export type BranchDto = z.infer<typeof BranchDtoSchema>;

export function toBranchDto(branch: Branch): BranchDto {
  return { ticketId: branch.ticketId, repoName: branch.repoName, branch: branch.branch, worktreePath: branch.worktreePath };
}
