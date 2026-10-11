import { z } from 'zod';

/** プロジェクトの削除。取り違えを防ぐため、名前をそのまま書く(confirmName)。 */
export const DeleteProjectInputSchema = z.object({ projectId: z.number().int(), confirmName: z.string() });
export type DeleteProjectInput = z.input<typeof DeleteProjectInputSchema>;
