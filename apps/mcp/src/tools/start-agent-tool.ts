import { type AnvilService, StartAgentInputSchema } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { contextOf, type McpBinding } from '../mcp-binding';
import { errorResult, okResult } from './tool-support';

/** anvil_start_agent — 動けるのに動いていないエージェントを起動・再開する(着手ボタン)。 */
export function registerStartAgentTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool(
    'anvil_start_agent',
    {
      description: '動けるのに動いていないエージェントを起動・再開する(着手ボタン)。',
      inputSchema: StartAgentInputSchema.shape,
    },
    async (args) => {
      try {
        return okResult(await service.flow.startAgentOf(contextOf(binding), args));
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}
