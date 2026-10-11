import type { Ticket } from '@anvil/entity';
import { z } from 'zod';
import { StateIdSchema } from './state-id';

/** 依存の一覧などで、チケットを短く示す形 */
export const TicketRefDtoSchema = z.object({ id: z.number().int(), title: z.string(), state: StateIdSchema });
export type TicketRefDto = z.infer<typeof TicketRefDtoSchema>;

export function toTicketRefDto(ticket: Ticket): TicketRefDto {
  return { id: ticket.id, title: ticket.title, state: ticket.state.id };
}
