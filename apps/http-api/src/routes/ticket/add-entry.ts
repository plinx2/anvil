import { AddEntryOutputSchema, type AnvilService } from '@anvil/service';
import { createRoute, z } from '@hono/zod-openapi';
import type { HttpApp } from '../../http-app';
import { ERROR_RESPONSES } from '../error-responses';
import { TicketIdParams } from '../params';

/** POST /api/tickets/{ticketId}/entries — エントリの追記(書き手は人間) */
export function registerAddEntry(app: HttpApp, service: AnvilService): void {
  const route = createRoute({
    method: 'post',
    path: '/api/tickets/{ticketId}/entries',
    operationId: 'addEntry',
    summary: 'エントリの追記',
    tags: ['ticket'],
    request: {
      params: TicketIdParams,
      body: { required: true, content: { 'application/json': { schema: z.object({ body: z.string() }) } } },
    },
    responses: {
      200: { description: '追記したエントリ', content: { 'application/json': { schema: AddEntryOutputSchema } } },
      ...ERROR_RESPONSES,
    },
  });

  app.openapi(route, async (c) => {
    const { ticketId } = c.req.valid('param');
    const { body } = c.req.valid('json');
    return c.json(await service.tickets.appendEntry(c.var.ctx, { ticketId, body }), 200);
  });
}
