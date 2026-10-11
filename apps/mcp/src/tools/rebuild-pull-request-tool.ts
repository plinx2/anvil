import { type AnvilService, RebuildPullRequestInputSchema } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { contextOf, type McpBinding } from '../mcp-binding';
import { errorResult, okResult } from './tool-support';

/** anvil_rebuild_pull_request — PR を作り直す。 */
export function registerRebuildPullRequestTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool(
    'anvil_rebuild_pull_request',
    {
      description: 'PR を作り直す。',
      inputSchema: RebuildPullRequestInputSchema.shape,
    },
    async (args) => {
      try {
        return okResult(await service.flow.rebuildPr(contextOf(binding), args));
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}
