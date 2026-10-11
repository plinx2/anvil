import { type AnvilService, GetDashboardOutputSchema } from '@anvil/service';
import { createRoute } from '@hono/zod-openapi';
import type { HttpApp } from '../../http-app';
import { ERROR_RESPONSES } from '../error-responses';

/** GET /api/dashboard — ダッシュボード(承認待ち、作業中、ゲート、完了数と昨対、最近のプロジェクト、振り返り、要対応) */
export function registerGetDashboard(app: HttpApp, service: AnvilService): void {
  const route = createRoute({
    method: 'get',
    path: '/api/dashboard',
    operationId: 'dashboard',
    summary: 'ダッシュボード',
    tags: ['dashboard'],
    responses: {
      200: { description: 'ダッシュボード', content: { 'application/json': { schema: GetDashboardOutputSchema } } },
      ...ERROR_RESPONSES,
    },
  });

  app.openapi(route, async (c) => {
    return c.json(await service.dashboard.show(c.var.ctx, {}), 200);
  });
}
