import { type AnvilService, GetIntakeInputSchema } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { contextOf, type McpBinding } from '../mcp-binding';
import { errorResult, okResult } from './tool-support';

/** anvil_get_intake — 起票の依頼の進み具合を読む。 */
export function registerGetIntakeTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool(
    'anvil_get_intake',
    {
      description: '起票の依頼の進み具合を読む。',
      inputSchema: GetIntakeInputSchema.shape,
    },
    async (args) => {
      try {
        return okResult(await service.intakes.progress(contextOf(binding), args));
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}
