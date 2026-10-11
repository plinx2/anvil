import type { AnvilService } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { contextOf, type McpBinding } from '../mcp-binding';
import { ticketIdArgument } from './ticket-id-argument';
import { errorResult, okResult, ticketIdOf } from './tool-support';

/** anvil_add_dependency — 依存関係を足す(ticketId は、dependsOnId が完了するまで着手できない)。 */
export function registerAddDependencyTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool(
    'anvil_add_dependency',
    {
      description: '依存関係を足す。ticketId は、dependsOnId が完了するまで着手できない。',
      inputSchema: { ...ticketIdArgument(binding), dependsOnId: z.number().int() },
    },
    async (args) => {
      try {
        return okResult(
          await service.tickets.addDependency(contextOf(binding), {
            ticketId: ticketIdOf(binding, args.ticketId),
            dependsOnId: args.dependsOnId,
          }),
        );
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}
