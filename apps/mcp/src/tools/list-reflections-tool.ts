import { type AnvilService, ListReflectionsInputSchema } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { contextOf, type McpBinding } from '../mcp-binding';
import { errorResult, okResult } from './tool-support';

/** anvil_list_reflections — 振り返りの一覧(採否、改善の対象、ロールで絞れる)。 */
export function registerListReflectionsTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool(
    'anvil_list_reflections',
    {
      description: '振り返りの一覧(採否、改善の対象、ロールで絞れる)。',
      inputSchema: ListReflectionsInputSchema.shape,
    },
    async (args) => {
      try {
        return okResult(await service.reflections.list(contextOf(binding), args));
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}
