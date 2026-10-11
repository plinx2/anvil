import type { AnvilService } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { contextOf, type McpBinding } from '../mcp-binding';
import { errorResult, okResult } from './tool-support';

/** anvil_list_projects — プロジェクトの一覧(チケット数、リポジトリ)。 */
export function registerListProjectsTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool('anvil_list_projects', { description: 'プロジェクトの一覧(チケット数、リポジトリ)。' }, async () => {
    try {
      return okResult(await service.projects.list(contextOf(binding), {}));
    } catch (e) {
      return errorResult(e);
    }
  });
}
