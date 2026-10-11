// MCP の実行。anvil を組み立て、HTTP の MCP(/mcp)として提供する。

import { anvilConfigFromEnv, createAnvil } from '@anvil/composition';
import { serve } from '@hono/node-server';
import { createMcpApp } from './create-mcp-app';

const port = Number(process.env.ANVIL_MCP_PORT ?? 4731);
const anvil = createAnvil(anvilConfigFromEnv({ ...process.env, ANVIL_MCP_PORT: String(port) }));

serve({ fetch: createMcpApp(anvil.service).fetch, port, hostname: '127.0.0.1' }, () => {
  console.log(`anvil MCP: ${anvil.config.mcpUrl}`);
});
