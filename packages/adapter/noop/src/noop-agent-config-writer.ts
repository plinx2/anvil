import type { AgentConfigRequest, AgentConfigWriter, RequestContext } from '@anvil/usecase';

/** 設定ファイルを書かずに、記録だけする(既定の構成と、テスト)。 */
export class NoopAgentConfigWriter implements AgentConfigWriter {
  readonly written: AgentConfigRequest[] = [];
  readonly removedPrefixes: string[] = [];

  async write(_ctx: RequestContext, request: AgentConfigRequest): Promise<string> {
    this.written.push(request);
    return `dry-run://${request.fileName}`;
  }

  async removeByPrefix(_ctx: RequestContext, prefix: string): Promise<void> {
    this.removedPrefixes.push(prefix);
  }
}
