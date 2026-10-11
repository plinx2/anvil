import { type AnvilService, UpdateTicketOutputSchema } from '@anvil/service';
import { createRoute, z } from '@hono/zod-openapi';
import type { HttpApp } from '../../http-app';
import { ERROR_RESPONSES } from '../error-responses';
import { TicketIdParams } from '../params';

/** PATCH /api/tickets/{ticketId} — チケットの更新(誰でもできる。slug は、ブランチを切る前だけ) */
export function registerUpdateTicket(app: HttpApp, service: AnvilService): void {
  const route = createRoute({
    method: 'patch',
    path: '/api/tickets/{ticketId}',
    operationId: 'updateTicket',
    summary: 'チケットの更新',
    tags: ['ticket'],
    request: {
      params: TicketIdParams,
      body: {
        required: true,
        content: {
          'application/json': {
            schema: z.object({
              title: z.string().optional(),
              body: z.string().optional(),
              slug: z.string().optional(),
              designNeeded: z.boolean().optional(),
              targetRepos: z.array(z.string()).optional(),
            }),
          },
        },
      },
    },
    responses: {
      200: { description: '更新したチケット', content: { 'application/json': { schema: UpdateTicketOutputSchema } } },
      ...ERROR_RESPONSES,
    },
  });

  app.openapi(route, async (c) => {
    const { ticketId } = c.req.valid('param');
    return c.json(await service.tickets.update(c.var.ctx, { ticketId, ...c.req.valid('json') }), 200);
  });
}
