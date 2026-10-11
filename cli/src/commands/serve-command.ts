import { createHttpApp } from '@anvil/http-api';
import { createMcpApp } from '@anvil/mcp';
import { serve } from '@hono/node-server';
import { defineCommand } from 'citty';
import { type CliDeps, guarded, toInt } from '../cli-deps';

/**
 * anvil serve — HTTP API(GUI も配信する)と MCP のサーバーを起動する。止めるのは、Ctrl+C。
 * MCP のポートは、エージェントに渡す MCP の設定(ANVIL_MCP_PORT、ANVIL_MCP_URL)と揃える必要があるので、環境変数で指定する。
 */
export const serveCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'serve', description: 'サーバー(HTTP API と GUI、MCP)を起動する' },
    args: {
      port: { type: 'string', description: 'HTTP API と GUI のポート(既定: ANVIL_HTTP_PORT、4730)' },
      only: { type: 'enum', options: ['http', 'mcp'], description: '片方だけ起動する' },
    },
    run: ({ args }) =>
      guarded(deps, async () => {
        const httpPort = args.port !== undefined ? toInt('--port', args.port) : Number(process.env.ANVIL_HTTP_PORT ?? 4730);
        const mcpPort = Number(process.env.ANVIL_MCP_PORT ?? 4731);
        const hostname = '127.0.0.1';

        if (args.only !== 'mcp') {
          serve({ fetch: createHttpApp(deps.service, { guiDir: deps.guiDir }).fetch, port: httpPort, hostname }, () =>
            deps.print(`anvil HTTP API: http://${hostname}:${httpPort}  (OpenAPI: /openapi.json、GUI: ${deps.guiDir ?? 'なし'})`),
          );
        }
        if (args.only !== 'http') {
          serve({ fetch: createMcpApp(deps.service).fetch, port: mcpPort, hostname }, () =>
            deps.print(`anvil MCP: http://${hostname}:${mcpPort}/mcp`),
          );
        }

        // サーバーが動いている間、待つ。Ctrl+C で止まる
        await new Promise<void>(() => {});
      }),
  });
