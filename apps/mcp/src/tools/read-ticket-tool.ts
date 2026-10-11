import type { AnvilService } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { contextOf, type McpBinding } from '../mcp-binding';
import { ticketIdArgument } from './ticket-id-argument';
import { errorResult, okResult, ticketIdOf } from './tool-support';

/** anvil_read_ticket — チケットの内容、状態、依存、直近 3 件のエントリ、総件数を読む。 */
export function registerReadTicketTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool(
    'anvil_read_ticket',
    {
      description: 'チケットの内容、状態、依存、直近のエントリ、総件数を読む。',
      inputSchema: { ...ticketIdArgument(binding) },
    },
    async (args) => {
      try {
        const { detail } = await service.tickets.detail(contextOf(binding), { ticketId: ticketIdOf(binding, args.ticketId) });
        return okResult({
          ticket: detail.ticket,
          dependsOn: detail.dependsOn,
          dependents: detail.dependents,
          entryCount: detail.entries.length,
          recentEntries: detail.entries.slice(-3),
        });
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}
