import { type AnvilService, StartTicketOutputSchema } from '@anvil/service';
import { createRoute } from '@hono/zod-openapi';
import type { HttpApp } from '../../http-app';
import { ERROR_RESPONSES } from '../error-responses';
import { TicketIdParams } from '../params';

/** POST /api/tickets/{ticketId}/start — TODO → リファイン(依存先が未完了なら進められない) */
export function registerStartTicket(app: HttpApp, service: AnvilService): void {
  const route = createRoute({
    method: 'post',
    path: '/api/tickets/{ticketId}/start',
    operationId: 'startTicket',
    summary: 'リファインに進める',
    tags: ['flow'],
    request: { params: TicketIdParams },
    responses: {
      200: { description: '進めたチケット', content: { 'application/json': { schema: StartTicketOutputSchema } } },
      ...ERROR_RESPONSES,
    },
  });

  app.openapi(route, async (c) => {
    const { ticketId } = c.req.valid('param');
    return c.json(await service.flow.start(c.var.ctx, { ticketId }), 200);
  });
}
