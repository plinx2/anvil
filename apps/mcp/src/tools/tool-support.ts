import { AnvilError } from '@anvil/entity';
import type { McpBinding } from '../mcp-binding';

/** ツールの応答(JSON の文字列にして返す) */
export function okResult(value: unknown) {
  return { content: [{ type: 'text' as const, text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }] };
}

/** ツールの失敗の応答(エージェントが、理由を読めるように、メッセージを返す) */
export function errorResult(e: unknown) {
  const message = e instanceof Error ? e.message : String(e);
  return { isError: true, content: [{ type: 'text' as const, text: message }] };
}

/** チケットの番号。結びつきがあれば、それを使う。無ければ、引数の ticketId(人間が使う Claude)。 */
export function ticketIdOf(binding: McpBinding, argument: number | undefined): number {
  const ticketId = binding.ticketId ?? argument;
  if (!ticketId) throw AnvilError.invalid('ticketId が必要');
  return ticketId;
}
