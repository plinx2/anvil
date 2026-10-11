import { type AnvilService, KindIdSchema, RequestIntakeOutputSchema, StateIdSchema } from '@anvil/service';
import { createRoute, z } from '@hono/zod-openapi';
import type { HttpApp } from '../../http-app';
import { ERROR_RESPONSES } from '../error-responses';

/** POST /api/intakes — 起票の依頼(GUI の起票ボタン。やりたいことを渡すと、PBI 起票担当が起動して、会話しながら起票する) */
export function registerRequestIntake(app: HttpApp, service: AnvilService): void {
  const route = createRoute({
    method: 'post',
    path: '/api/intakes',
    operationId: 'requestIntake',
    summary: '起票の依頼',
    tags: ['intake'],
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: z.object({
              sourceTicketId: z.number().int().optional(),
              projectId: z.number().int().optional(),
              discard: z.boolean().optional(),
              items: z.array(
                z.object({
                  wish: z.string(),
                  kind: KindIdSchema.optional(),
                  startState: StateIdSchema.optional(),
                  slug: z.string().optional(),
                  autoGate: z.boolean().optional(),
                  dependsOn: z.array(z.number().int()).optional(),
                }),
              ),
            }),
          },
        },
      },
    },
    responses: {
      200: { description: '起票の依頼の番号', content: { 'application/json': { schema: RequestIntakeOutputSchema } } },
      ...ERROR_RESPONSES,
    },
  });

  app.openapi(route, async (c) => {
    return c.json(await service.intakes.request(c.var.ctx, c.req.valid('json')), 200);
  });
}
