import type { Role } from '@anvil/entity';
import type { RequestContext } from '../request-context';

export interface AgentConfigRequest {
  readonly fileName: string;
  readonly role: Role;
  /** チケットに結びつけるとき */
  readonly ticketId?: number;
  /** 起票の依頼の項目に結びつけるとき(PBI 起票担当) */
  readonly intakeItemId?: number;
  readonly projectId?: number;
}

/**
 * エージェントに渡す、anvil の MCP の設定を書く。チケットとロールは、ここで結びつく
 * (エージェントは、他のチケットを動かせない)。書いたファイルのパスを返す。
 */
export interface AgentConfigWriter {
  write(ctx: RequestContext, request: AgentConfigRequest): Promise<string>;
  /** 書いた設定のうち、ファイル名が prefix で始まるものを消す(`t3-`、`intake2-`) */
  removeByPrefix(ctx: RequestContext, prefix: string): Promise<void>;
}
