import { AddRepoInputSchema, type AnvilService } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { contextOf, type McpBinding } from '../mcp-binding';
import { errorResult, okResult } from './tool-support';

/** anvil_add_repo — プロジェクトにリポジトリを登録する(ローカルのパス、デフォルトブランチ、リモートの有無)。 */
export function registerAddRepoTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool(
    'anvil_add_repo',
    {
      description: 'プロジェクトにリポジトリを登録する(ローカルのパス、デフォルトブランチ、リモートの有無)。',
      inputSchema: AddRepoInputSchema.shape,
    },
    async (args) => {
      try {
        return okResult(await service.projects.addRepo(contextOf(binding), args));
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}
