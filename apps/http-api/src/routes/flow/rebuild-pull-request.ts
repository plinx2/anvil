import { type AnvilService, RebuildPullRequestOutputSchema } from '@anvil/service';
import { createRoute } from '@hono/zod-openapi';
import type { HttpApp } from '../../http-app';
import { ERROR_RESPONSES } from '../error-responses';
import { TicketIdParams } from '../params';

/** POST /api/tickets/{ticketId}/pr — PR を作り直す(作成に失敗したとき) */
export function registerRebuildPullRequest(app: HttpApp, service: AnvilService): void {
  const route = createRoute({
    method: 'post',
    path: '/api/tickets/{ticketId}/pr',
    operationId: 'rebuildPr',
    summary: 'PR を作り直す',
    tags: ['flow'],
    request: { params: TicketIdParams },
    responses: {
      200: { description: 'チケット', content: { 'application/json': { schema: RebuildPullRequestOutputSchema } } },
      ...ERROR_RESPONSES,
    },
  });

  app.openapi(route, async (c) => {
    const { ticketId } = c.req.valid('param');
    return c.json(await service.flow.rebuildPr(c.var.ctx, { ticketId }), 200);
  });
}
