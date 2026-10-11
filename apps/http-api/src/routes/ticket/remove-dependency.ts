import { type AnvilService, RemoveDependencyOutputSchema } from '@anvil/service';
import { createRoute, z } from '@hono/zod-openapi';
import type { HttpApp } from '../../http-app';
import { ERROR_RESPONSES } from '../error-responses';
import { IdParam } from '../params';

/** DELETE /api/tickets/{ticketId}/dependencies/{dependsOnId} — 依存を外す */
export function registerRemoveDependency(app: HttpApp, service: AnvilService): void {
  const route = createRoute({
    method: 'delete',
    path: '/api/tickets/{ticketId}/dependencies/{dependsOnId}',
    operationId: 'removeDependency',
    summary: '依存を外す',
    tags: ['ticket'],
    request: { params: z.object({ ticketId: IdParam, dependsOnId: IdParam }) },
    responses: {
      200: { description: '外した', content: { 'application/json': { schema: RemoveDependencyOutputSchema } } },
      ...ERROR_RESPONSES,
    },
  });

  app.openapi(route, async (c) => {
    const { ticketId, dependsOnId } = c.req.valid('param');
    return c.json(await service.tickets.removeDependency(c.var.ctx, { ticketId, dependsOnId }), 200);
  });
}
