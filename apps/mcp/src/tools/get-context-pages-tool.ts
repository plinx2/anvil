import { type AnvilService, GetContextPagesInputSchema } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { contextOf, type McpBinding } from '../mcp-binding';
import { errorResult, okResult } from './tool-support';

/** anvil_get_context_pages — プロジェクトコンテキストのページを読む。 */
export function registerGetContextPagesTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool(
    'anvil_get_context_pages',
    {
      description: 'プロジェクトコンテキストのページを読む。',
      inputSchema: GetContextPagesInputSchema.shape,
    },
    async (args) => {
      try {
        return okResult(await service.projects.contextPages(contextOf(binding), args));
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}
