import { type AnvilService, DecideReflectionInputSchema } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { contextOf, type McpBinding } from '../mcp-binding';
import { errorResult, okResult } from './tool-support';

/** anvil_decide_reflection — 振り返りの採否を決める(採用 / 却下)。人間が使う Claude に、人間が依頼したときだけ。 */
export function registerDecideReflectionTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool(
    'anvil_decide_reflection',
    {
      description: '振り返りの採否を決める(採用 / 却下)。人間が使う Claude に、人間が依頼したときだけ。',
      inputSchema: DecideReflectionInputSchema.shape,
    },
    async (args) => {
      try {
        return okResult(await service.reflections.decide(contextOf(binding), args));
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}
