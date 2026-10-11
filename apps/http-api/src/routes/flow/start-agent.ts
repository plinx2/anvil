import { type AnvilService, StartAgentOutputSchema } from '@anvil/service';
import { createRoute } from '@hono/zod-openapi';
import type { HttpApp } from '../../http-app';
import { ERROR_RESPONSES } from '../error-responses';
import { TicketIdParams } from '../params';

/** POST /api/tickets/{ticketId}/agent/start — 着手(動いていないエージェントを起動する。同じ状態の途中なら再開する) */
export function registerStartAgent(app: HttpApp, service: AnvilService): void {
  const route = createRoute({
    method: 'post',
    path: '/api/tickets/{ticketId}/agent/start',
    operationId: 'startAgent',
    summary: '着手(エージェントを起動)',
    tags: ['flow'],
    request: { params: TicketIdParams },
    responses: {
      200: { description: 'チケット', content: { 'application/json': { schema: StartAgentOutputSchema } } },
      ...ERROR_RESPONSES,
    },
  });

  app.openapi(route, async (c) => {
    const { ticketId } = c.req.valid('param');
    return c.json(await service.flow.startAgentOf(c.var.ctx, { ticketId }), 200);
  });
}
