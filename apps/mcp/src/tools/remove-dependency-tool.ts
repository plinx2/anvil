import { type AnvilService, RemoveDependencyInputSchema } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { contextOf, type McpBinding } from '../mcp-binding';
import { errorResult, okResult } from './tool-support';

/** anvil_remove_dependency — 依存を外す。 */
export function registerRemoveDependencyTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool(
    'anvil_remove_dependency',
    {
      description: '依存を外す。',
      inputSchema: RemoveDependencyInputSchema.shape,
    },
    async (args) => {
      try {
        return okResult(await service.tickets.removeDependency(contextOf(binding), args));
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}
