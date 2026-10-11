import type { AnvilService } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { contextOf, type McpBinding } from '../mcp-binding';
import { errorResult, okResult } from './tool-support';

/** anvil_dashboard — ダッシュボード(承認待ち、ゲートにあるチケット、着手可など)。 */
export function registerDashboardTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool('anvil_dashboard', { description: 'ダッシュボード(承認待ち、ゲートにあるチケット、着手可など)。' }, async () => {
    try {
      return okResult(await service.dashboard.show(contextOf(binding), {}));
    } catch (e) {
      return errorResult(e);
    }
  });
}
