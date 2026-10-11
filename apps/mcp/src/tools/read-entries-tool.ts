import { type AnvilService, StateIdSchema } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { contextOf, type McpBinding } from '../mcp-binding';
import { ticketIdArgument } from './ticket-id-argument';
import { errorResult, okResult, ticketIdOf } from './tool-support';

/** anvil_read_entries — チケットのエントリを読む(既定は全件。状態、直近の件数で絞れる)。 */
export function registerReadEntriesTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool(
    'anvil_read_entries',
    {
      description: 'チケットのエントリを読む。既定は全件。state で状態を、limit で直近の件数を絞れる。',
      inputSchema: { ...ticketIdArgument(binding), state: StateIdSchema.optional(), limit: z.number().int().optional() },
    },
    async (args) => {
      try {
        return okResult(
          await service.tickets.entries(contextOf(binding), {
            ticketId: ticketIdOf(binding, args.ticketId),
            state: args.state,
            limit: args.limit,
          }),
        );
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}
