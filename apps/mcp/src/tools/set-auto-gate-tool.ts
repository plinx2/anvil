import { type AnvilService, SetAutoGateInputSchema } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { contextOf, type McpBinding } from '../mcp-binding';
import { errorResult, okResult } from './tool-support';

/** anvil_set_auto_gate — 自動ゲート承認フラグを切り替える(実装前ゲートだけを判断なしで突破する)。 */
export function registerSetAutoGateTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool(
    'anvil_set_auto_gate',
    {
      description: '自動ゲート承認フラグを切り替える(実装前ゲートだけを判断なしで突破する)。',
      inputSchema: SetAutoGateInputSchema.shape,
    },
    async (args) => {
      try {
        return okResult(await service.tickets.changeAutoGate(contextOf(binding), args));
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}
