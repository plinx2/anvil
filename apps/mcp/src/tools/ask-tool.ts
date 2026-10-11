import type { AnvilService } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { contextOf, type McpBinding } from '../mcp-binding';
import { ticketIdArgument } from './ticket-id-argument';
import { errorResult, okResult, ticketIdOf } from './tool-support';

/** anvil_ask — 人間への質問。承認待ちフラグを立てて、同じ状態のまま、回答を待つ。 */
export function registerAskTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool(
    'anvil_ask',
    {
      description:
        '人間への質問。承認待ちフラグを立てて、同じ状態のまま、人間の回答を待つ。質問を本文に書く。迷ったら立てる。ゲートの判断は自分でしない。',
      inputSchema: { ...ticketIdArgument(binding), question: z.string() },
    },
    async (args) => {
      try {
        return okResult(
          await service.flags.ask(contextOf(binding), { ticketId: ticketIdOf(binding, args.ticketId), question: args.question }),
        );
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}
