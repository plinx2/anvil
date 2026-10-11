import { Actor, Role } from '@anvil/entity';
import { newRequestContext, type RequestContext } from '@anvil/service';

/**
 * 呼び出しの結びつき。anvil がエージェントを起動するとき、MCP の設定のヘッダーで、チケットとロールを結びつける
 * (エージェントは、他のチケットを動かせない)。結びつきが無いとき(人間が使う Claude)は、人間として振る舞う。
 */
export interface McpBinding {
  readonly ticketId?: number;
  readonly role?: Role;
  readonly intakeItemId?: number;
  readonly projectId?: number;
}

export function bindingFromHeaders(headers: Headers): McpBinding {
  const number = (name: string) => (headers.get(name) ? Number(headers.get(name)) : undefined);
  return {
    ticketId: number('x-anvil-ticket'),
    role: Role.find(headers.get('x-anvil-role') ?? ''),
    intakeItemId: number('x-anvil-intake-item'),
    projectId: number('x-anvil-project'),
  };
}

/** 結びつきから、リクエストの文脈を作る(ロールがあればそのエージェント、無ければ人間)。 */
export function contextOf(binding: McpBinding): RequestContext {
  return newRequestContext(binding.role ? Actor.ofRole(binding.role) : Actor.human());
}
