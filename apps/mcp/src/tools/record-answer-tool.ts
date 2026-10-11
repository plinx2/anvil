import { Actor } from '@anvil/entity';
import { type AnvilService, newRequestContext } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { McpBinding } from '../mcp-binding';
import { ticketIdArgument } from './ticket-id-argument';
import { errorResult, okResult, ticketIdOf } from './tool-support';

/**
 * anvil_record_answer — 人間が会話の中で回答したとき、その回答を、人間のエントリとして記録し、承認待ちフラグを下ろす。
 * エージェントが代わりに書くので、書き手は人間(文脈の主体を人間にする)。
 */
export function registerRecordAnswerTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool(
    'anvil_record_answer',
    {
      description: '人間が会話の中で回答したとき、その回答を、人間のエントリとして記録し、承認待ちフラグを下ろす。',
      inputSchema: { ...ticketIdArgument(binding), answer: z.string() },
    },
    async (args) => {
      try {
        const ctx = newRequestContext(Actor.human());
        return okResult(
          await service.flags.answer(ctx, {
            ticketId: ticketIdOf(binding, args.ticketId),
            answer: args.answer,
            viaAgent: binding.role !== undefined,
          }),
        );
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}
