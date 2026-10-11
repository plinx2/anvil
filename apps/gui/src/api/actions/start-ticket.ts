import { client } from '../client';
import { ticketPath } from '../ticket-path';
import { unwrap } from '../unwrap';

export async function startTicket(id: number) {
  return unwrap(await client.POST('/api/tickets/{ticketId}/start', ticketPath(id)));
}
