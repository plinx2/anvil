import { type AnvilService, SetAutoGateOutputSchema } from '@anvil/service';
import { createRoute, z } from '@hono/zod-openapi';
import type { HttpApp } from '../../http-app';
import { ERROR_RESPONSES } from '../error-responses';
import { TicketIdParams } from '../params';

/** POST /api/tickets/{ticketId}/auto-gate — 自動ゲート承認フラグの切り替え(起票後も可能) */
export function registerSetAutoGate(app: HttpApp, service: AnvilService): void {
  const route = createRoute({
    method: 'post',
    path: '/api/tickets/{ticketId}/auto-gate',
    operationId: 'setAutoGate',
    summary: '自動ゲート承認フラグの切り替え',
    tags: ['ticket'],
    request: {
      params: TicketIdParams,
      body: { required: true, content: { 'application/json': { schema: z.object({ on: z.boolean() }) } } },
    },
    responses: {
      200: { description: '更新したチケット', content: { 'application/json': { schema: SetAutoGateOutputSchema } } },
      ...ERROR_RESPONSES,
    },
  });

  app.openapi(route, async (c) => {
    const { ticketId } = c.req.valid('param');
    const { on } = c.req.valid('json');
    return c.json(await service.tickets.changeAutoGate(c.var.ctx, { ticketId, on }), 200);
  });
}
