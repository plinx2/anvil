import { type AnvilService, CreateProjectInputSchema } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { contextOf, type McpBinding } from '../mcp-binding';
import { errorResult, okResult } from './tool-support';

/** anvil_create_project — プロジェクトを登録する。 */
export function registerCreateProjectTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool(
    'anvil_create_project',
    {
      description: 'プロジェクトを登録する。',
      inputSchema: CreateProjectInputSchema.shape,
    },
    async (args) => {
      try {
        return okResult(await service.projects.create(contextOf(binding), args));
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}
