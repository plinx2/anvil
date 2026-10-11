import { type AnvilService, GetTicketDetailOutputSchema } from '@anvil/service';
import { createRoute } from '@hono/zod-openapi';
import type { HttpApp } from '../../http-app';
import { ERROR_RESPONSES } from '../error-responses';
import { TicketIdParams } from '../params';

/** GET /api/tickets/{ticketId} — チケットの詳細(エントリ、依存、起動の記録、状態の履歴、ブランチ) */
export function registerGetTicketDetail(app: HttpApp, service: AnvilService): void {
  const route = createRoute({
    method: 'get',
    path: '/api/tickets/{ticketId}',
    operationId: 'ticketDetail',
    summary: 'チケットの詳細',
    tags: ['ticket'],
    request: { params: TicketIdParams },
    responses: {
      200: { description: 'チケットの詳細', content: { 'application/json': { schema: GetTicketDetailOutputSchema } } },
      ...ERROR_RESPONSES,
    },
  });

  app.openapi(route, async (c) => {
    const { ticketId } = c.req.valid('param');
    return c.json(await service.tickets.detail(c.var.ctx, { ticketId }), 200);
  });
}
