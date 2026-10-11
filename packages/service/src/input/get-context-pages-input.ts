import { z } from 'zod';

/** プロジェクトコンテキストのページを読む */
export const GetContextPagesInputSchema = z.object({ projectId: z.number().int() });
export type GetContextPagesInput = z.input<typeof GetContextPagesInputSchema>;
