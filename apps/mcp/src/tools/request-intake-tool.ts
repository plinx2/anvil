import { type AnvilService, KindIdSchema, StateIdSchema } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { contextOf, type McpBinding } from '../mcp-binding';
import { ticketIdArgument } from './ticket-id-argument';
import { errorResult, okResult } from './tool-support';

/** anvil_request_intake — 起票の依頼(分割・スパイク共通)。ロールのエージェントは AC 担当と実装方針担当だけ。 */
export function registerRequestIntakeTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool(
    'anvil_request_intake',
    {
      description:
        '起票の依頼(分割・スパイク共通)。ロールのエージェントは AC 担当と実装方針担当だけが使える。人間が使う Claude は、元のチケット(ticketId)の代わりに projectId を渡して、新規の起票を依頼できる。discard が true なら、全部起票された後に元のチケットを破棄する。false なら、元のチケットが新しいチケットすべてに依存する(スパイク)。',
      inputSchema: {
        ...ticketIdArgument(binding),
        projectId: z.number().int().optional().describe('元のチケットが無い起票の依頼(人間が使う Claude)'),
        discard: z.boolean().optional(),
        items: z.array(
          z.object({
            wish: z.string().describe('やりたいこと。分割元の関連情報(分割理由、割り振る AC)も含める'),
            kind: KindIdSchema.optional(),
            startState: StateIdSchema.optional(),
            slug: z.string().optional(),
            autoGate: z.boolean().optional(),
            dependsOn: z.array(z.number().int()).optional(),
          }),
        ),
      },
    },
    async (args) => {
      try {
        return okResult(
          await service.intakes.request(contextOf(binding), {
            sourceTicketId: binding.ticketId ?? args.ticketId,
            projectId: args.projectId,
            discard: args.discard,
            items: args.items,
          }),
        );
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}
