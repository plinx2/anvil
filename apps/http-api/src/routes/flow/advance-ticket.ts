import { AdvanceTicketOutputSchema, type AnvilService } from '@anvil/service';
import { createRoute, z } from '@hono/zod-openapi';
import type { HttpApp } from '../../http-app';
import { ERROR_RESPONSES } from '../error-responses';
import { TicketIdParams } from '../params';

/** POST /api/tickets/{ticketId}/advance — 次へ(担当が、作業を終えて進める。申し送りを添えられる) */
export function registerAdvanceTicket(app: HttpApp, service: AnvilService): void {
  const route = createRoute({
    method: 'post',
    path: '/api/tickets/{ticketId}/advance',
    operationId: 'advanceTicket',
    summary: '次へ進める',
    tags: ['flow'],
    request: {
      params: TicketIdParams,
      body: { required: true, content: { 'application/json': { schema: z.object({ handoff: z.string().optional() }) } } },
    },
    responses: {
      200: { description: '進めたチケット', content: { 'application/json': { schema: AdvanceTicketOutputSchema } } },
      ...ERROR_RESPONSES,
    },
  });

  app.openapi(route, async (c) => {
    const { ticketId } = c.req.valid('param');
    const { handoff } = c.req.valid('json');
    return c.json(await service.flow.advance(c.var.ctx, { ticketId, handoff }), 200);
  });
}
