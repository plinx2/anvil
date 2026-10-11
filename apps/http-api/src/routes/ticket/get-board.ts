import { type AnvilService, GetBoardOutputSchema } from '@anvil/service';
import { createRoute, z } from '@hono/zod-openapi';
import type { HttpApp } from '../../http-app';
import { ERROR_RESPONSES } from '../error-responses';
import { IdParam } from '../params';

/** GET /api/board — カンバン(チケットの一覧。プロジェクトで絞れる) */
export function registerGetBoard(app: HttpApp, service: AnvilService): void {
  const route = createRoute({
    method: 'get',
    path: '/api/board',
    operationId: 'board',
    summary: 'カンバン',
    tags: ['ticket'],
    request: { query: z.object({ projectId: IdParam.optional() }) },
    responses: {
      200: { description: 'チケットの一覧', content: { 'application/json': { schema: GetBoardOutputSchema } } },
      ...ERROR_RESPONSES,
    },
  });

  app.openapi(route, async (c) => {
    const { projectId } = c.req.valid('query');
    return c.json(await service.tickets.board(c.var.ctx, { projectId }), 200);
  });
}
