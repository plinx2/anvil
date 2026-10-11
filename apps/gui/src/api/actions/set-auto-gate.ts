import { client } from '../client';
import { ticketPath } from '../ticket-path';
import { unwrap } from '../unwrap';

export async function setAutoGate(id: number, on: boolean) {
  return unwrap(await client.POST('/api/tickets/{ticketId}/auto-gate', { ...ticketPath(id), body: { on } }));
}
