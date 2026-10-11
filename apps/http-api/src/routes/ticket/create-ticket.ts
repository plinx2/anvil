import { type AnvilService, CreateTicketOutputSchema, KindIdSchema, StateIdSchema } from '@anvil/service';
import { createRoute, z } from '@hono/zod-openapi';
import type { HttpApp } from '../../http-app';
import { ERROR_RESPONSES } from '../error-responses';

/** POST /api/tickets — 起票(任意の状態で。既定は TODO、スパイクは実装前ゲート) */
export function registerCreateTicket(app: HttpApp, service: AnvilService): void {
  const route = createRoute({
    method: 'post',
    path: '/api/tickets',
    operationId: 'createTicket',
    summary: '起票',
    tags: ['ticket'],
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: z.object({
              projectId: z.number().int(),
              title: z.string(),
              body: z.string().optional(),
              kind: KindIdSchema.optional(),
              state: StateIdSchema.optional(),
              slug: z.string().optional(),
              autoGate: z.boolean().optional(),
              designNeeded: z.boolean().optional(),
              dependsOn: z.array(z.number().int()).optional(),
              targetRepos: z.array(z.string()).optional(),
              intakeItemId: z.number().int().optional(),
            }),
          },
        },
      },
    },
    responses: {
      200: { description: '起票したチケット', content: { 'application/json': { schema: CreateTicketOutputSchema } } },
      ...ERROR_RESPONSES,
    },
  });

  app.openapi(route, async (c) => {
    return c.json(await service.tickets.create(c.var.ctx, c.req.valid('json')), 200);
  });
}
