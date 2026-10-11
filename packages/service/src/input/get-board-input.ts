import { z } from 'zod';

/** カンバン(チケットの一覧)。プロジェクトで絞れる */
export const GetBoardInputSchema = z.object({ projectId: z.number().int().optional() });
export type GetBoardInput = z.input<typeof GetBoardInputSchema>;
