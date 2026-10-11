import { type AnvilService, UpdateRepoOutputSchema } from '@anvil/service';
import { createRoute, z } from '@hono/zod-openapi';
import type { HttpApp } from '../../http-app';
import { ERROR_RESPONSES } from '../error-responses';
import { ProjectIdParams } from '../params';

/** PATCH /api/projects/{projectId}/repos/{name} — リポジトリの設定の更新(指定した項目だけ。名前は変えられない) */
export function registerUpdateRepo(app: HttpApp, service: AnvilService): void {
  const route = createRoute({
    method: 'patch',
    path: '/api/projects/{projectId}/repos/{name}',
    operationId: 'updateRepo',
    summary: 'リポジトリの更新',
    tags: ['project'],
    request: {
      params: ProjectIdParams.extend({ name: z.string() }),
      body: {
        required: true,
        content: {
          'application/json': {
            schema: z.object({
              defaultBranch: z.string().optional(),
              hasRemote: z.boolean().optional(),
              path: z.string().optional(),
            }),
          },
        },
      },
    },
    responses: {
      200: { description: '更新後の、プロジェクトのリポジトリ一覧', content: { 'application/json': { schema: UpdateRepoOutputSchema } } },
      ...ERROR_RESPONSES,
    },
  });

  app.openapi(route, async (c) => {
    const { projectId, name } = c.req.valid('param');
    return c.json(await service.projects.updateRepo(c.var.ctx, { projectId, name, ...c.req.valid('json') }), 200);
  });
}
