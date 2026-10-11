import { type AnvilService, PassPreDesignGateInputSchema } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { contextOf, type McpBinding } from '../mcp-binding';
import { errorResult, okResult } from './tool-support';

/** anvil_pass_pre_design_gate — 設計前ゲートを突破する(SP が必須。ブランチを切る)。人間が使う Claude に、人間が依頼したときだけ。 */
export function registerPassPreDesignGateTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool(
    'anvil_pass_pre_design_gate',
    {
      description: '設計前ゲートを突破する(SP が必須。ブランチを切る)。人間が使う Claude に、人間が依頼したときだけ。',
      inputSchema: PassPreDesignGateInputSchema.shape,
    },
    async (args) => {
      try {
        return okResult(await service.flow.passDesignGate(contextOf(binding), args));
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}
