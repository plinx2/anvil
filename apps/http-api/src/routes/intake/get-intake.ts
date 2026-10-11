import { type AnvilService, GetIntakeOutputSchema } from '@anvil/service';
import { createRoute } from '@hono/zod-openapi';
import type { HttpApp } from '../../http-app';
import { ERROR_RESPONSES } from '../error-responses';
import { IntakeIdParams } from '../params';

/** GET /api/intakes/{intakeId} — 起票の依頼の進み具合 */
export function registerGetIntake(app: HttpApp, service: AnvilService): void {
  const route = createRoute({
    method: 'get',
    path: '/api/intakes/{intakeId}',
    operationId: 'getIntake',
    summary: '起票の依頼の進み具合',
    tags: ['intake'],
    request: { params: IntakeIdParams },
    responses: {
      200: { description: '起票の依頼と、その項目', content: { 'application/json': { schema: GetIntakeOutputSchema } } },
      ...ERROR_RESPONSES,
    },
  });

  app.openapi(route, async (c) => {
    const { intakeId } = c.req.valid('param');
    return c.json(await service.intakes.progress(c.var.ctx, { intakeId }), 200);
  });
}
