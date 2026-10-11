import type { RequestContext } from '@anvil/service';
import type { OpenAPIHono } from '@hono/zod-openapi';

/** ルートのハンドラーが、リクエストの文脈を取り出せる、HTTP アプリケーションの型。 */
export type HttpApp = OpenAPIHono<{ Variables: { ctx: RequestContext } }>;
