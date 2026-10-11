import type { DeleteProjectOutput as UseCaseOutput } from '@anvil/usecase';
import { z } from 'zod';

export const DeleteProjectOutputSchema = z.object({
  /** 消したチケットの数 */
  tickets: z.number().int(),
  /** 消したリポジトリの登録の数 */
  repos: z.number().int(),
  /** 消した起票の依頼の数 */
  intakes: z.number().int(),
  /** 残したブランチ(リポジトリ名:ブランチ名)。リポジトリそのものと、ブランチには触れない */
  keptBranches: z.array(z.string()),
});
export type DeleteProjectOutput = z.infer<typeof DeleteProjectOutputSchema>;

export function toDeleteProjectOutput(output: UseCaseOutput): DeleteProjectOutput {
  return { tickets: output.tickets, repos: output.repos, intakes: output.intakes, keptBranches: [...output.keptBranches] };
}
