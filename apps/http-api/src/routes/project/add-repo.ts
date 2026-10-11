import { AddRepoOutputSchema, type AnvilService } from '@anvil/service';
import { createRoute, z } from '@hono/zod-openapi';
import type { HttpApp } from '../../http-app';
import { ERROR_RESPONSES } from '../error-responses';
import { ProjectIdParams } from '../params';

/** POST /api/projects/{projectId}/repos — リポジトリの登録(1 つのリポジトリは、1 つのプロジェクトにだけ属する) */
export function registerAddRepo(app: HttpApp, service: AnvilService): void {
  const route = createRoute({
    method: 'post',
    path: '/api/projects/{projectId}/repos',
    operationId: 'addRepo',
    summary: 'リポジトリの登録',
    tags: ['project'],
    request: {
      params: ProjectIdParams,
      body: {
        required: true,
        content: {
          'application/json': {
            schema: z.object({
              name: z.string(),
              path: z.string(),
              defaultBranch: z.string().optional(),
              hasRemote: z.boolean().optional(),
            }),
          },
        },
      },
    },
    responses: {
      200: { description: '登録後の、プロジェクトのリポジトリ一覧', content: { 'application/json': { schema: AddRepoOutputSchema } } },
      ...ERROR_RESPONSES,
    },
  });

  app.openapi(route, async (c) => {
    const { projectId } = c.req.valid('param');
    return c.json(await service.projects.addRepo(c.var.ctx, { projectId, ...c.req.valid('json') }), 200);
  });
}
