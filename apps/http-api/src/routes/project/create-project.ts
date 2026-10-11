import { type AnvilService, CreateProjectOutputSchema } from '@anvil/service';
import { createRoute, z } from '@hono/zod-openapi';
import type { HttpApp } from '../../http-app';
import { ERROR_RESPONSES } from '../error-responses';

/** POST /api/projects — プロジェクトの登録 */
export function registerCreateProject(app: HttpApp, service: AnvilService): void {
  const route = createRoute({
    method: 'post',
    path: '/api/projects',
    operationId: 'createProject',
    summary: 'プロジェクトの登録',
    tags: ['project'],
    request: { body: { required: true, content: { 'application/json': { schema: z.object({ name: z.string() }) } } } },
    responses: {
      200: { description: '登録したプロジェクト', content: { 'application/json': { schema: CreateProjectOutputSchema } } },
      ...ERROR_RESPONSES,
    },
  });

  app.openapi(route, async (c) => {
    return c.json(await service.projects.create(c.var.ctx, c.req.valid('json')), 200);
  });
}
