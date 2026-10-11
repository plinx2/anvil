import type { AnvilService } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { contextOf, type McpBinding } from '../mcp-binding';
import { ticketIdArgument } from './ticket-id-argument';
import { errorResult, okResult, ticketIdOf } from './tool-support';

/** anvil_add_entry — 成果物、申し送り、気づきを、エントリ(追記のみ)として書く。 */
export function registerAddEntryTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool(
    'anvil_add_entry',
    {
      description: '成果物、申し送り、気づきを、エントリ(追記のみ)として書く。内容はすべて本文に書く。',
      inputSchema: { ...ticketIdArgument(binding), body: z.string() },
    },
    async (args) => {
      try {
        return okResult(
          await service.tickets.appendEntry(contextOf(binding), { ticketId: ticketIdOf(binding, args.ticketId), body: args.body }),
        );
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}
