import type { GetDashboard, RequestContext } from '@anvil/usecase';
import { type GetDashboardInput, GetDashboardInputSchema } from '../input/get-dashboard-input';
import { type GetDashboardOutput, toGetDashboardOutput } from '../output/get-dashboard-output';

/** ダッシュボード。 */
export class DashboardService {
  constructor(private readonly getDashboard: GetDashboard) {}

  async show(ctx: RequestContext, input: GetDashboardInput): Promise<GetDashboardOutput> {
    return toGetDashboardOutput(await this.getDashboard.execute(ctx, GetDashboardInputSchema.parse(input)));
  }
}
