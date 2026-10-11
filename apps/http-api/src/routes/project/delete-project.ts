import { type AnvilService, DeleteProjectOutputSchema } from '@anvil/service';
import { createRoute, z } from '@hono/zod-openapi';
import type { HttpApp } from '../../http-app';
import { ERROR_RESPONSES } from '../error-responses';
import { ProjectIdParams } from '../params';

/** DELETE /api/projects/{projectId}?confirmName=… — プロジェクトの削除(関わるデータをすべて消す。リポジトリとブランチは残す) */
export function registerDeleteProject(app: HttpApp, service: AnvilService): void {
  const route = createRoute({
    method: 'delete',
    path: '/api/projects/{projectId}',
    operationId: 'deleteProject',
    summary: 'プロジェクトの削除',
    description: '関わるデータをすべて消す。リポジトリそのものと、ブランチは残す。取り違えを防ぐため、名前をそのまま confirmName に書く。',
    tags: ['project'],
    request: { params: ProjectIdParams, query: z.object({ confirmName: z.string() }) },
    responses: {
      200: { description: '消した数と、残したブランチ', content: { 'application/json': { schema: DeleteProjectOutputSchema } } },
      ...ERROR_RESPONSES,
    },
  });

  app.openapi(route, async (c) => {
    const { projectId } = c.req.valid('param');
    const { confirmName } = c.req.valid('query');
    return c.json(await service.projects.delete(c.var.ctx, { projectId, confirmName }), 200);
  });
}
