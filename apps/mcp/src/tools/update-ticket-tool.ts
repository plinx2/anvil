import type { AnvilService } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { contextOf, type McpBinding } from '../mcp-binding';
import { ticketIdArgument } from './ticket-id-argument';
import { errorResult, okResult, ticketIdOf } from './tool-support';

/** anvil_update_ticket — チケットの項目を更新する(誰でもできる)。 */
export function registerUpdateTicketTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool(
    'anvil_update_ticket',
    {
      description:
        'チケットの項目を更新する(誰でもできる)。対象リポジトリ(targetRepos)、デザインの要否、slug、タイトル、内容。slug はブランチを切る前だけ。',
      inputSchema: {
        ...ticketIdArgument(binding),
        title: z.string().optional(),
        body: z.string().optional(),
        slug: z.string().optional(),
        designNeeded: z.boolean().optional(),
        targetRepos: z.array(z.string()).optional(),
      },
    },
    async (args) => {
      try {
        const { ticketId, ...edit } = args;
        return okResult(await service.tickets.update(contextOf(binding), { ticketId: ticketIdOf(binding, ticketId), ...edit }));
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}
