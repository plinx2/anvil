import { type AnvilService, ListProjectsOutputSchema } from '@anvil/service';
import { createRoute } from '@hono/zod-openapi';
import type { HttpApp } from '../../http-app';
import { ERROR_RESPONSES } from '../error-responses';

/** GET /api/projects — プロジェクトの一覧(リポジトリ、チケットの数つき) */
export function registerListProjects(app: HttpApp, service: AnvilService): void {
  const route = createRoute({
    method: 'get',
    path: '/api/projects',
    operationId: 'listProjects',
    summary: 'プロジェクトの一覧',
    tags: ['project'],
    responses: {
      200: { description: 'プロジェクトの一覧', content: { 'application/json': { schema: ListProjectsOutputSchema } } },
      ...ERROR_RESPONSES,
    },
  });

  app.openapi(route, async (c) => {
    return c.json(await service.projects.list(c.var.ctx, {}), 200);
  });
}
