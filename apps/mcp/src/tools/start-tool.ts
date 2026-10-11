import type { AnvilService } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { contextOf, type McpBinding } from '../mcp-binding';
import { errorResult, okResult } from './tool-support';

/** anvil_start — TODO のチケットを、リファインへ進める(人間が使う Claude に、人間が依頼したとき)。 */
export function registerStartTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool(
    'anvil_start',
    {
      description: 'TODO のチケットをリファインへ進める(人間に依頼されたとき)。',
      inputSchema: { ticketId: z.number().int() },
    },
    async (args) => {
      try {
        return okResult(await service.flow.start(contextOf(binding), { ticketId: args.ticketId }));
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}
