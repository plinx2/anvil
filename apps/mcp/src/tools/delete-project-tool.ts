import { type AnvilService, DeleteProjectInputSchema } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { contextOf, type McpBinding } from '../mcp-binding';
import { errorResult, okResult } from './tool-support';

/** anvil_delete_project — プロジェクトの削除。人間が使う Claude だけ。 */
export function registerDeleteProjectTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool(
    'anvil_delete_project',
    {
      description:
        'プロジェクトを削除する(元に戻せない)。チケット、起票の依頼、リポジトリの登録、エージェント、ワークツリー、プロジェクトコンテキストを消す。リポジトリそのものとブランチは残す。人間が依頼したときだけ使う。confirmName に、プロジェクトの名前をそのまま書く。',
      inputSchema: DeleteProjectInputSchema.shape,
    },
    async (args) => {
      try {
        return okResult(await service.projects.delete(contextOf(binding), args));
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}
