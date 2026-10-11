import { client } from '../client';
import { ticketPath } from '../ticket-path';
import { unwrap } from '../unwrap';

export async function startAgent(id: number) {
  return unwrap(await client.POST('/api/tickets/{ticketId}/agent/start', ticketPath(id)));
}
