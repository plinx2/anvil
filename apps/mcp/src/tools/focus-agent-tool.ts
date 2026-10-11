import { type AnvilService, FocusAgentInputSchema } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { contextOf, type McpBinding } from '../mcp-binding';
import { errorResult, okResult } from './tool-support';

/** anvil_focus_agent — エージェントのペインを前面に出す。 */
export function registerFocusAgentTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool(
    'anvil_focus_agent',
    {
      description: 'エージェントのペインを前面に出す。',
      inputSchema: FocusAgentInputSchema.shape,
    },
    async (args) => {
      try {
        return okResult(await service.flow.focusAgentOf(contextOf(binding), args));
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}
