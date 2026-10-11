import { type AnvilService, PassPreDoneGateInputSchema } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { contextOf, type McpBinding } from '../mcp-binding';
import { errorResult, okResult } from './tool-support';

/** anvil_pass_pre_done_gate — 完了前ゲートを突破する(完了にする)。人間が使う Claude に、人間が依頼したときだけ。 */
export function registerPassPreDoneGateTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool(
    'anvil_pass_pre_done_gate',
    {
      description: '完了前ゲートを突破する(完了にする)。人間が使う Claude に、人間が依頼したときだけ。',
      inputSchema: PassPreDoneGateInputSchema.shape,
    },
    async (args) => {
      try {
        return okResult(await service.flow.passDoneGate(contextOf(binding), args));
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}
