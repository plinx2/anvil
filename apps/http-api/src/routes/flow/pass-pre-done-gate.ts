import { type AnvilService, PassPreDoneGateOutputSchema } from '@anvil/service';
import { createRoute } from '@hono/zod-openapi';
import type { HttpApp } from '../../http-app';
import { ERROR_RESPONSES } from '../error-responses';
import { TicketIdParams } from '../params';

/** POST /api/tickets/{ticketId}/gates/pre-done — 完了前ゲートの承認(人間のみ。チケットを完了にする) */
export function registerPassPreDoneGate(app: HttpApp, service: AnvilService): void {
  const route = createRoute({
    method: 'post',
    path: '/api/tickets/{ticketId}/gates/pre-done',
    operationId: 'passPreDoneGate',
    summary: '完了前ゲートを承認(完了にする)',
    tags: ['flow'],
    request: { params: TicketIdParams },
    responses: {
      200: { description: '完了したチケット', content: { 'application/json': { schema: PassPreDoneGateOutputSchema } } },
      ...ERROR_RESPONSES,
    },
  });

  app.openapi(route, async (c) => {
    const { ticketId } = c.req.valid('param');
    return c.json(await service.flow.passDoneGate(c.var.ctx, { ticketId }), 200);
  });
}
