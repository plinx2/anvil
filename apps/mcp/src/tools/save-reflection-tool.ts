import { type AnvilService, ReflectionTargetSchema } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { contextOf, type McpBinding } from '../mcp-binding';
import { ticketIdArgument } from './ticket-id-argument';
import { errorResult, okResult } from './tool-support';

/** anvil_save_reflection — 作業完了時の振り返りを保存する(次へ進める前に)。ロールのエージェントだけ。 */
export function registerSaveReflectionTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool(
    'anvil_save_reflection',
    {
      description: '作業完了時の振り返りを保存する(次へ進める前に)。target は role / anvil / skill / project_doc のどれか。',
      inputSchema: {
        ...ticketIdArgument(binding),
        good: z.string().optional(),
        trouble: z.string().optional(),
        hypothesis: z.string().optional(),
        proposal: z.string().optional(),
        target: ReflectionTargetSchema.optional(),
        evidence: z.string().optional(),
      },
    },
    async (args) => {
      try {
        return okResult(await service.reflections.save(contextOf(binding), { ...args, ticketId: binding.ticketId ?? args.ticketId }));
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}
