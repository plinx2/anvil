import type { AgentLaunch, AgentRuntime, RequestContext } from '@anvil/usecase';

/** エージェントを起動しない(既定の構成と、テスト)。呼び出しを記録するだけ。 */
export class NoopAgentRuntime implements AgentRuntime {
  readonly calls: Array<{ operation: 'launch' | 'stop' | 'send' | 'focus'; argument: unknown }> = [];
  /** null: 分からない(anvil の記録を信じる)。false にすると、落ちている状態にできる(テスト用) */
  running: boolean | null = null;

  /** 設定すると、次の起動がこの理由で失敗する(テスト用) */
  launchError: Error | null = null;

  async launch(_ctx: RequestContext, launch: AgentLaunch): Promise<void> {
    if (this.launchError) throw this.launchError;
    this.calls.push({ operation: 'launch', argument: launch });
  }

  async stop(_ctx: RequestContext, name: string): Promise<void> {
    this.calls.push({ operation: 'stop', argument: name });
  }

  async isRunning(_ctx: RequestContext, _name: string): Promise<boolean | null> {
    return this.running;
  }

  async send(_ctx: RequestContext, name: string, text: string): Promise<void> {
    this.calls.push({ operation: 'send', argument: { name, text } });
  }

  async focus(_ctx: RequestContext, name: string): Promise<void> {
    this.calls.push({ operation: 'focus', argument: name });
  }

  /** 起動したエージェントの名前(起動した順) */
  launchedNames(): string[] {
    return this.calls.filter((c) => c.operation === 'launch').map((c) => (c.argument as AgentLaunch).name);
  }

  launches(): AgentLaunch[] {
    return this.calls.filter((c) => c.operation === 'launch').map((c) => c.argument as AgentLaunch);
  }
}
