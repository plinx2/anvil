import { z } from 'zod';
import type { McpBinding } from '../mcp-binding';

/** チケットに結びついているエージェントには、ticketId の引数を出さない(他のチケットを指せない)。 */
export function ticketIdArgument(binding: McpBinding): { ticketId?: z.ZodNumber } {
  return binding.ticketId ? {} : { ticketId: z.number().int().describe('チケットの番号') };
}
