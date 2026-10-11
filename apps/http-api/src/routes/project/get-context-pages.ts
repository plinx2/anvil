import { type AnvilService, GetContextPagesOutputSchema } from '@anvil/service';
import { createRoute } from '@hono/zod-openapi';
import type { HttpApp } from '../../http-app';
import { ERROR_RESPONSES } from '../error-responses';
import { ProjectIdParams } from '../params';

/** GET /api/projects/{projectId}/context — プロジェクトコンテキストのページ(閲覧) */
export function registerGetContextPages(app: HttpApp, service: AnvilService): void {
  const route = createRoute({
    method: 'get',
    path: '/api/projects/{projectId}/context',
    operationId: 'getContextPages',
    summary: 'プロジェクトコンテキスト',
    tags: ['project'],
    request: { params: ProjectIdParams },
    responses: {
      200: { description: 'ページの一覧', content: { 'application/json': { schema: GetContextPagesOutputSchema } } },
      ...ERROR_RESPONSES,
    },
  });

  app.openapi(route, async (c) => {
    const { projectId } = c.req.valid('param');
    return c.json(await service.projects.contextPages(c.var.ctx, { projectId }), 200);
  });
}
