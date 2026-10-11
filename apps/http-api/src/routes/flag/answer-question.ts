import { AnswerQuestionOutputSchema, type AnvilService } from '@anvil/service';
import { createRoute, z } from '@hono/zod-openapi';
import type { HttpApp } from '../../http-app';
import { ERROR_RESPONSES } from '../error-responses';
import { TicketIdParams } from '../params';

/** POST /api/tickets/{ticketId}/answer — 承認待ちフラグへの回答(人間。同じ状態が続く) */
export function registerAnswerQuestion(app: HttpApp, service: AnvilService): void {
  const route = createRoute({
    method: 'post',
    path: '/api/tickets/{ticketId}/answer',
    operationId: 'answerQuestion',
    summary: '承認待ちに回答する',
    tags: ['flag'],
    request: {
      params: TicketIdParams,
      body: { required: true, content: { 'application/json': { schema: z.object({ answer: z.string() }) } } },
    },
    responses: {
      200: { description: 'チケット', content: { 'application/json': { schema: AnswerQuestionOutputSchema } } },
      ...ERROR_RESPONSES,
    },
  });

  app.openapi(route, async (c) => {
    const { ticketId } = c.req.valid('param');
    const { answer } = c.req.valid('json');
    return c.json(await service.flags.answer(c.var.ctx, { ticketId, answer }), 200);
  });
}
