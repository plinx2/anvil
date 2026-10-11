import { AnvilError } from '@anvil/entity';
import { type AnvilService, KindIdSchema, StateIdSchema } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { contextOf, type McpBinding } from '../mcp-binding';
import { errorResult, okResult } from './tool-support';

/**
 * anvil_create_ticket — チケットを起票する。
 * PBI 起票担当は、起票の依頼の項目に結びついているので、起票したチケットが、その項目に紐づく。人間が使う Claude は projectId が必要。
 */
export function registerCreateTicketTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool(
    'anvil_create_ticket',
    {
      description:
        'チケットを起票する。PBI 起票担当は、起票の依頼の項目に結びついているので、それが自動で紐づく。人間が使う Claude は projectId が必要。',
      inputSchema: {
        projectId: z.number().int().optional(),
        title: z.string(),
        body: z.string().describe('タイトル以外(ペイン、ゲイン、AC など。形はプロジェクトコンテキストに従う)'),
        kind: KindIdSchema.optional(),
        state: StateIdSchema.optional(),
        slug: z.string().optional(),
        autoGate: z.boolean().optional(),
        dependsOn: z.array(z.number().int()).optional(),
      },
    },
    async (args) => {
      try {
        const projectId = args.projectId ?? binding.projectId;
        if (!projectId) throw AnvilError.invalid('projectId が必要');
        return okResult(await service.tickets.create(contextOf(binding), { ...args, projectId, intakeItemId: binding.intakeItemId }));
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}
