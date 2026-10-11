import { type AnvilService, DiscardTicketInputSchema } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { contextOf, type McpBinding } from '../mcp-binding';
import { errorResult, okResult } from './tool-support';

/** anvil_discard_ticket — チケットを破棄する(削除)。ブランチとワークツリーは消さず、人間に知らせる。 */
export function registerDiscardTicketTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool(
    'anvil_discard_ticket',
    {
      description: 'チケットを破棄する(削除)。ブランチとワークツリーは消さず、人間に知らせる。',
      inputSchema: DiscardTicketInputSchema.shape,
    },
    async (args) => {
      try {
        return okResult(await service.tickets.discard(contextOf(binding), args));
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}
