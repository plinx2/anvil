import { type AnvilService, DecideReflectionOutputSchema, ReflectionStatusSchema } from '@anvil/service';
import { createRoute, z } from '@hono/zod-openapi';
import type { HttpApp } from '../../http-app';
import { ERROR_RESPONSES } from '../error-responses';
import { ReflectionIdParams } from '../params';

/** POST /api/reflections/{reflectionId}/decision — 振り返りの採否(未判断 / 採用 / 却下。採用しても、anvil は反映しない) */
export function registerDecideReflection(app: HttpApp, service: AnvilService): void {
  const route = createRoute({
    method: 'post',
    path: '/api/reflections/{reflectionId}/decision',
    operationId: 'decideReflection',
    summary: '振り返りの採否',
    tags: ['reflection'],
    request: {
      params: ReflectionIdParams,
      body: {
        required: true,
        content: { 'application/json': { schema: z.object({ status: ReflectionStatusSchema, reason: z.string().optional() }) } },
      },
    },
    responses: {
      200: { description: '判断した振り返り', content: { 'application/json': { schema: DecideReflectionOutputSchema } } },
      ...ERROR_RESPONSES,
    },
  });

  app.openapi(route, async (c) => {
    const { reflectionId } = c.req.valid('param');
    const { status, reason } = c.req.valid('json');
    return c.json(await service.reflections.decide(c.var.ctx, { reflectionId, status, reason }), 200);
  });
}
