import { type AnvilService, RollbackTicketOutputSchema, StateIdSchema } from '@anvil/service';
import { createRoute, z } from '@hono/zod-openapi';
import type { HttpApp } from '../../http-app';
import { ERROR_RESPONSES } from '../error-responses';
import { TicketIdParams } from '../params';

/** POST /api/tickets/{ticketId}/rollback — 差し戻し(誰でもできる。理由は必須で、エントリに残る) */
export function registerRollbackTicket(app: HttpApp, service: AnvilService): void {
  const route = createRoute({
    method: 'post',
    path: '/api/tickets/{ticketId}/rollback',
    operationId: 'rollbackTicket',
    summary: '差し戻す',
    tags: ['flow'],
    request: {
      params: TicketIdParams,
      body: {
        required: true,
        content: { 'application/json': { schema: z.object({ reason: z.string(), target: StateIdSchema.optional() }) } },
      },
    },
    responses: {
      200: { description: '差し戻したチケット', content: { 'application/json': { schema: RollbackTicketOutputSchema } } },
      ...ERROR_RESPONSES,
    },
  });

  app.openapi(route, async (c) => {
    const { ticketId } = c.req.valid('param');
    const { reason, target } = c.req.valid('json');
    return c.json(await service.flow.rollback(c.var.ctx, { ticketId, reason, target }), 200);
  });
}
