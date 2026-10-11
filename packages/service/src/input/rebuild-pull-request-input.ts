import { z } from 'zod';

/** PR を作り直す */
export const RebuildPullRequestInputSchema = z.object({ ticketId: z.number().int() });
export type RebuildPullRequestInput = z.input<typeof RebuildPullRequestInputSchema>;
