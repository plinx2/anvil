import { type AnvilService, FocusAgentOutputSchema } from '@anvil/service';
import { createRoute } from '@hono/zod-openapi';
import type { HttpApp } from '../../http-app';
import { ERROR_RESPONSES } from '../error-responses';
import { TicketIdParams } from '../params';

/** POST /api/tickets/{ticketId}/agent/focus — 該当のエージェントのペインを開く(人間が、会話しに行く) */
export function registerFocusAgent(app: HttpApp, service: AnvilService): void {
  const route = createRoute({
    method: 'post',
    path: '/api/tickets/{ticketId}/agent/focus',
    operationId: 'focusAgent',
    summary: 'ペインを開く',
    tags: ['flow'],
    request: { params: TicketIdParams },
    responses: {
      200: { description: '開いた', content: { 'application/json': { schema: FocusAgentOutputSchema } } },
      ...ERROR_RESPONSES,
    },
  });

  app.openapi(route, async (c) => {
    const { ticketId } = c.req.valid('param');
    return c.json(await service.flow.focusAgentOf(c.var.ctx, { ticketId }), 200);
  });
}
