import { Actor } from '@anvil/entity';
import { newRequestContext } from '@anvil/service';
import type { MiddlewareHandler } from 'hono';

/** HTTP API を使うのは人間(GUI)。リクエストごとに、人間の文脈を作る。エージェントは、MCP を使う。 */
export const requestContextMiddleware: MiddlewareHandler = async (c, next) => {
  c.set('ctx', newRequestContext(Actor.human()));
  await next();
};
