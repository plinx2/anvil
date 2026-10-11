import { client } from '../client';
import { ticketPath } from '../ticket-path';
import { unwrap } from '../unwrap';

export async function addEntry(id: number, body: string) {
  return unwrap(await client.POST('/api/tickets/{ticketId}/entries', { ...ticketPath(id), body: { body } }));
}
