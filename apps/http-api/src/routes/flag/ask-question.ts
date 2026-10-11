import { type AnvilService, AskQuestionOutputSchema } from '@anvil/service';
import { createRoute, z } from '@hono/zod-openapi';
import type { HttpApp } from '../../http-app';
import { ERROR_RESPONSES } from '../error-responses';
import { TicketIdParams } from '../params';

/** POST /api/tickets/{ticketId}/ask — 人間への質問(承認待ちフラグを立てる。同じ状態のまま、回答を待つ) */
export function registerAskQuestion(app: HttpApp, service: AnvilService): void {
  const route = createRoute({
    method: 'post',
    path: '/api/tickets/{ticketId}/ask',
    operationId: 'askQuestion',
    summary: '承認待ちフラグを立てて質問する',
    tags: ['flag'],
    request: {
      params: TicketIdParams,
      body: { required: true, content: { 'application/json': { schema: z.object({ question: z.string() }) } } },
    },
    responses: {
      200: { description: 'チケット', content: { 'application/json': { schema: AskQuestionOutputSchema } } },
      ...ERROR_RESPONSES,
    },
  });

  app.openapi(route, async (c) => {
    const { ticketId } = c.req.valid('param');
    const { question } = c.req.valid('json');
    return c.json(await service.flags.ask(c.var.ctx, { ticketId, question }), 200);
  });
}
