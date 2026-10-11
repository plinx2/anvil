import type { AnvilService } from '@anvil/service';
import { OpenAPIHono } from '@hono/zod-openapi';
import { errorHandler } from './error-handler';
import type { HttpApp } from './http-app';
import { OPENAPI_INFO } from './openapi-info';
import { requestContextMiddleware } from './request-context-middleware';
import { registerRoutes } from './routes/register-routes';
import { serveGui } from './serve-gui';

export interface HttpAppOptions {
  /** ビルドした GUI のディレクトリ。あれば、配信する。 */
  guiDir?: string;
}

/** HTTP API を組み立てる。入り口は、routes/register-routes.ts に 1 つずつ並んでいる。 */
export function createHttpApp(service: AnvilService, options: HttpAppOptions = {}): HttpApp {
  const app: HttpApp = new OpenAPIHono({
    // 入力の検証に失敗したら、{ error, code } の形で返す
    defaultHook: (result, c) => {
      if (!result.success) {
        return c.json({ error: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '), code: 'invalid' }, 400);
      }
    },
  });

  app.use('*', requestContextMiddleware);
  app.onError(errorHandler);
  registerRoutes(app, service);
  app.doc31('/openapi.json', OPENAPI_INFO);
  if (options.guiDir) serveGui(app, options.guiDir);
  return app;
}
