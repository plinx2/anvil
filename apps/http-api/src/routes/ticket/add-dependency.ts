import { AddDependencyOutputSchema, type AnvilService } from '@anvil/service';
import { createRoute, z } from '@hono/zod-openapi';
import type { HttpApp } from '../../http-app';
import { ERROR_RESPONSES } from '../error-responses';
import { TicketIdParams } from '../params';

/** POST /api/tickets/{ticketId}/dependencies — 依存を足す(ticketId は、dependsOnId が完了するまで着手できない) */
export function registerAddDependency(app: HttpApp, service: AnvilService): void {
  const route = createRoute({
    method: 'post',
    path: '/api/tickets/{ticketId}/dependencies',
    operationId: 'addDependency',
    summary: '依存を足す',
    tags: ['ticket'],
    request: {
      params: TicketIdParams,
      body: { required: true, content: { 'application/json': { schema: z.object({ dependsOnId: z.number().int() }) } } },
    },
    responses: {
      200: { description: '足した', content: { 'application/json': { schema: AddDependencyOutputSchema } } },
      ...ERROR_RESPONSES,
    },
  });

  app.openapi(route, async (c) => {
    const { ticketId } = c.req.valid('param');
    const { dependsOnId } = c.req.valid('json');
    return c.json(await service.tickets.addDependency(c.var.ctx, { ticketId, dependsOnId }), 200);
  });
}
