import { client } from '../client';
import { ticketPath } from '../ticket-path';
import { unwrap } from '../unwrap';

export async function updateTicket(
  id: number,
  body: { title?: string; body?: string; slug?: string; designNeeded?: boolean; targetRepos?: string[] },
) {
  return unwrap(await client.PATCH('/api/tickets/{ticketId}', { ...ticketPath(id), body }));
}
