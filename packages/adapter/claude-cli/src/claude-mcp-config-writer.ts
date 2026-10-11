import fs from 'node:fs';
import path from 'node:path';
import type { AgentConfigRequest, AgentConfigWriter, RequestContext } from '@anvil/usecase';

/**
 * Claude Code の `--mcp-config` の形式(HTTP の MCP)で、設定ファイルを書く。
 * チケットとロールは、ヘッダーに結びつく(エージェントは、他のチケットを動かせない)。
 */
export class ClaudeMcpConfigWriter implements AgentConfigWriter {
  constructor(
    private readonly home: string,
    private readonly mcpUrl: string,
  ) {}

  async write(_ctx: RequestContext, request: AgentConfigRequest): Promise<string> {
    const headers: Record<string, string> = { 'x-anvil-role': request.role.id };
    if (request.ticketId !== undefined) headers['x-anvil-ticket'] = String(request.ticketId);
    if (request.intakeItemId !== undefined) headers['x-anvil-intake-item'] = String(request.intakeItemId);
    if (request.projectId !== undefined) headers['x-anvil-project'] = String(request.projectId);

    const file = path.join(this.home, 'mcp', request.fileName);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify({ mcpServers: { anvil: { type: 'http', url: this.mcpUrl, headers } } }, null, 2));
    return file;
  }

  async removeByPrefix(_ctx: RequestContext, prefix: string): Promise<void> {
    const dir = path.join(this.home, 'mcp');
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
      if (name.startsWith(prefix)) fs.rmSync(path.join(dir, name), { force: true });
    }
  }
}
