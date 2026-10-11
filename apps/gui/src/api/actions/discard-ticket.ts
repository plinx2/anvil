import { client } from '../client';
import { ticketPath } from '../ticket-path';
import { unwrap } from '../unwrap';

export async function discardTicket(id: number) {
  return unwrap(await client.DELETE('/api/tickets/{ticketId}', ticketPath(id)));
}
