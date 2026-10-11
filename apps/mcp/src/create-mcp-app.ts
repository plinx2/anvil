import type { AnvilService } from '@anvil/service';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { Hono } from 'hono';
import { bindingFromHeaders } from './mcp-binding';
import { registerTools } from './tools/register-tools';

/**
 * MCP(Streamable HTTP)。状態を持たない: リクエストごとに、ヘッダーの結びつきに合わせた、ツールを持つサーバーを作る。
 * エージェントには、チケットとロールをヘッダーで結びつけた設定(anvil が書く)を渡す。
 */
export function createMcpApp(service: AnvilService): Hono {
  const app = new Hono();

  app.all('/mcp', async (c) => {
    const server = new McpServer({ name: 'anvil', version: '0.0.1' });
    registerTools(server, service, bindingFromHeaders(c.req.raw.headers));

    const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    await server.connect(transport);
    return transport.handleRequest(c.req.raw);
  });

  return app;
}
