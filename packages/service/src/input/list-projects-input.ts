import { z } from 'zod';

/** プロジェクトの一覧 */
export const ListProjectsInputSchema = z.object({});
export type ListProjectsInput = z.input<typeof ListProjectsInputSchema>;
