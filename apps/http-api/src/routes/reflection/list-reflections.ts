import {
  type AnvilService,
  ListReflectionsOutputSchema,
  ReflectionStatusSchema,
  ReflectionTargetSchema,
  RoleIdSchema,
} from '@anvil/service';
import { createRoute, z } from '@hono/zod-openapi';
import type { HttpApp } from '../../http-app';
import { ERROR_RESPONSES } from '../error-responses';

/** GET /api/reflections — 振り返りの一覧(採否、改善の対象、ロールで絞れる) */
export function registerListReflections(app: HttpApp, service: AnvilService): void {
  const route = createRoute({
    method: 'get',
    path: '/api/reflections',
    operationId: 'listReflections',
    summary: '振り返りの一覧',
    tags: ['reflection'],
    request: {
      query: z.object({
        status: ReflectionStatusSchema.optional(),
        target: ReflectionTargetSchema.optional(),
        role: RoleIdSchema.optional(),
      }),
    },
    responses: {
      200: { description: '振り返りの一覧', content: { 'application/json': { schema: ListReflectionsOutputSchema } } },
      ...ERROR_RESPONSES,
    },
  });

  app.openapi(route, async (c) => {
    return c.json(await service.reflections.list(c.var.ctx, c.req.valid('query')), 200);
  });
}
