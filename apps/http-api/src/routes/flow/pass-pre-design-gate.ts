import { type AnvilService, PassPreDesignGateOutputSchema } from '@anvil/service';
import { createRoute, z } from '@hono/zod-openapi';
import type { HttpApp } from '../../http-app';
import { ERROR_RESPONSES } from '../error-responses';
import { TicketIdParams } from '../params';

/** POST /api/tickets/{ticketId}/gates/pre-design — 設計前ゲートの突破(人間。SP が必須。ブランチとワークツリーを切る) */
export function registerPassPreDesignGate(app: HttpApp, service: AnvilService): void {
  const route = createRoute({
    method: 'post',
    path: '/api/tickets/{ticketId}/gates/pre-design',
    operationId: 'passPreDesignGate',
    summary: '設計前ゲートを突破',
    tags: ['flow'],
    request: {
      params: TicketIdParams,
      body: { required: true, content: { 'application/json': { schema: z.object({ sp: z.number() }) } } },
    },
    responses: {
      200: { description: '突破したチケット', content: { 'application/json': { schema: PassPreDesignGateOutputSchema } } },
      ...ERROR_RESPONSES,
    },
  });

  app.openapi(route, async (c) => {
    const { ticketId } = c.req.valid('param');
    const { sp } = c.req.valid('json');
    return c.json(await service.flow.passDesignGate(c.var.ctx, { ticketId, sp }), 200);
  });
}
