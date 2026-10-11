import type { AnvilService } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { contextOf, type McpBinding } from '../mcp-binding';
import { ticketIdArgument } from './ticket-id-argument';
import { errorResult, okResult, ticketIdOf } from './tool-support';

/** anvil_advance — 作業を終えて、次の状態へ進める(呼ぶと、自分は終了される)。 */
export function registerAdvanceTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool(
    'anvil_advance',
    {
      description:
        '自分の作業を終えて、次の状態へ進める。先に anvil_save_reflection で振り返りを保存しておく。呼ぶと、自分は終了される。handoff に、次の担当への申し送りを書ける。',
      inputSchema: { ...ticketIdArgument(binding), handoff: z.string().optional() },
    },
    async (args) => {
      try {
        return okResult(
          await service.flow.advance(contextOf(binding), { ticketId: ticketIdOf(binding, args.ticketId), handoff: args.handoff }),
        );
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}
