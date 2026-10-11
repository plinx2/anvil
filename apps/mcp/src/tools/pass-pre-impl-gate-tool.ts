import { type AnvilService, PassPreImplGateInputSchema } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { contextOf, type McpBinding } from '../mcp-binding';
import { errorResult, okResult } from './tool-support';

/** anvil_pass_pre_impl_gate — 実装前ゲートを突破する。人間が使う Claude に、人間が依頼したときだけ。 */
export function registerPassPreImplGateTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool(
    'anvil_pass_pre_impl_gate',
    {
      description: '実装前ゲートを突破する。人間が使う Claude に、人間が依頼したときだけ。',
      inputSchema: PassPreImplGateInputSchema.shape,
    },
    async (args) => {
      try {
        return okResult(await service.flow.passImplGate(contextOf(binding), args));
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}
