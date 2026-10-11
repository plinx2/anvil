import type { RequestContext } from '../request-context';
import type { AgentLaunch } from './agent-launch';

/** AI エージェントを動かす実行環境。エージェントの種類(Claude Code、Copilot、Codex など)ごとに、実装を足せる。 */
export interface AgentRuntime {
  launch(ctx: RequestContext, launch: AgentLaunch): Promise<void>;
  stop(ctx: RequestContext, name: string): Promise<void>;
  /** 動いているか。分からなければ null(anvil の記録を信じる) */
  isRunning(ctx: RequestContext, name: string): Promise<boolean | null>;
  /** 名前のエージェントに、入力を送る(許可待ちなどで受けられないなら、送らずに失敗する) */
  send(ctx: RequestContext, name: string, text: string): Promise<void>;
  /** ペインを開く(GUI から) */
  focus(ctx: RequestContext, name: string): Promise<void>;
}
