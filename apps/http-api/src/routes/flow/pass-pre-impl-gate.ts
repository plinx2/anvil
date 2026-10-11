import { type AnvilService, PassPreImplGateOutputSchema } from '@anvil/service';
import { createRoute } from '@hono/zod-openapi';
import type { HttpApp } from '../../http-app';
import { ERROR_RESPONSES } from '../error-responses';
import { TicketIdParams } from '../params';

/** POST /api/tickets/{ticketId}/gates/pre-impl — 実装前ゲートの承認(人間) */
export function registerPassPreImplGate(app: HttpApp, service: AnvilService): void {
  const route = createRoute({
    method: 'post',
    path: '/api/tickets/{ticketId}/gates/pre-impl',
    operationId: 'passPreImplGate',
    summary: '実装前ゲートを承認',
    tags: ['flow'],
    request: { params: TicketIdParams },
    responses: {
      200: { description: '突破したチケット', content: { 'application/json': { schema: PassPreImplGateOutputSchema } } },
      ...ERROR_RESPONSES,
    },
  });

  app.openapi(route, async (c) => {
    const { ticketId } = c.req.valid('param');
    return c.json(await service.flow.passImplGate(c.var.ctx, { ticketId }), 200);
  });
}
