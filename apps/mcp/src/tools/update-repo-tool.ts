import { type AnvilService, UpdateRepoInputSchema } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { contextOf, type McpBinding } from '../mcp-binding';
import { errorResult, okResult } from './tool-support';

/** anvil_update_repo — 登録済みリポジトリの設定を更新する(指定した項目だけ。名前は変えられない)。 */
export function registerUpdateRepoTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool(
    'anvil_update_repo',
    {
      description:
        '登録済みリポジトリの設定(ローカルのパス、デフォルトブランチ、リモートの有無)を更新する。指定した項目だけ変わる。リポジトリは、プロジェクトと名前で指す(名前は変えられない)。',
      inputSchema: UpdateRepoInputSchema.shape,
    },
    async (args) => {
      try {
        return okResult(await service.projects.updateRepo(contextOf(binding), args));
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}
