import { z } from 'zod';

/** ダッシュボード */
export const GetDashboardInputSchema = z.object({});
export type GetDashboardInput = z.input<typeof GetDashboardInputSchema>;
