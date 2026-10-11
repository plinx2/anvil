import type { AnvilService } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { contextOf, type McpBinding } from '../mcp-binding';
import { errorResult, okResult } from './tool-support';

/** anvil_board — チケットの一覧(状態、承認待ち、着手可など)。 */
export function registerBoardTool(server: McpServer, service: AnvilService, binding: McpBinding): void {
  server.registerTool(
    'anvil_board',
    {
      description: 'チケットの一覧(状態、承認待ち、着手可など)。projectId で絞れる。',
      inputSchema: { projectId: z.number().int().optional() },
    },
    async (args) => {
      try {
        const { tickets } = await service.tickets.board(contextOf(binding), { projectId: args.projectId });
        return okResult(
          tickets.map((t) => ({
            id: t.id,
            title: t.title,
            project: t.project,
            state: t.state,
            kind: t.kind,
            awaiting: t.awaiting,
            ready: t.ready,
            slug: t.slug,
          })),
        );
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}
