import { type AnvilService, DiscardTicketOutputSchema } from '@anvil/service';
import { createRoute } from '@hono/zod-openapi';
import type { HttpApp } from '../../http-app';
import { ERROR_RESPONSES } from '../error-responses';
import { TicketIdParams } from '../params';

/** DELETE /api/tickets/{ticketId} — チケットの破棄(削除。ブランチとワークツリーは残して、人間に知らせる) */
export function registerDiscardTicket(app: HttpApp, service: AnvilService): void {
  const route = createRoute({
    method: 'delete',
    path: '/api/tickets/{ticketId}',
    operationId: 'discardTicket',
    summary: 'チケットの破棄',
    tags: ['ticket'],
    request: { params: TicketIdParams },
    responses: {
      200: { description: '残したブランチ', content: { 'application/json': { schema: DiscardTicketOutputSchema } } },
      ...ERROR_RESPONSES,
    },
  });

  app.openapi(route, async (c) => {
    const { ticketId } = c.req.valid('param');
    return c.json(await service.tickets.discard(c.var.ctx, { ticketId }), 200);
  });
}
