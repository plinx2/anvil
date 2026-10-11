import { type AnvilService, StateIdSchema } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { contextOf, type McpBinding } from '../mcp-binding';
import { ticketIdArgument } from './ticket-id-argument';
import { errorResult, okResult, ticketIdOf } from './tool-support';

/** anvil_rollback — 差し戻す(理由は必須。エントリに残る)。 */
export function registerRollbackTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool(
    'anvil_rollback',
    {
      description: '差し戻す。理由は必須(エントリに残る)。target を省くと、カテゴリ内の最初の状態に戻る。',
      inputSchema: { ...ticketIdArgument(binding), reason: z.string(), target: StateIdSchema.optional() },
    },
    async (args) => {
      try {
        return okResult(
          await service.flow.rollback(contextOf(binding), {
            ticketId: ticketIdOf(binding, args.ticketId),
            reason: args.reason,
            target: args.target,
          }),
        );
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}
