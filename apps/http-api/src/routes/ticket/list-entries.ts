import { type AnvilService, ListEntriesOutputSchema, StateIdSchema } from '@anvil/service';
import { createRoute, z } from '@hono/zod-openapi';
import type { HttpApp } from '../../http-app';
import { ERROR_RESPONSES } from '../error-responses';
import { IdParam, TicketIdParams } from '../params';

/** GET /api/tickets/{ticketId}/entries — エントリの読み取り(状態、直近の件数で絞れる) */
export function registerListEntries(app: HttpApp, service: AnvilService): void {
  const route = createRoute({
    method: 'get',
    path: '/api/tickets/{ticketId}/entries',
    operationId: 'listEntries',
    summary: 'エントリの読み取り',
    tags: ['ticket'],
    request: {
      params: TicketIdParams,
      query: z.object({ state: StateIdSchema.optional(), limit: IdParam.optional() }),
    },
    responses: {
      200: { description: 'エントリと総件数', content: { 'application/json': { schema: ListEntriesOutputSchema } } },
      ...ERROR_RESPONSES,
    },
  });

  app.openapi(route, async (c) => {
    const { ticketId } = c.req.valid('param');
    const { state, limit } = c.req.valid('query');
    return c.json(await service.tickets.entries(c.var.ctx, { ticketId, state, limit }), 200);
  });
}
