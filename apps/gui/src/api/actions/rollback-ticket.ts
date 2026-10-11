import { client } from '../client';
import { ticketPath } from '../ticket-path';
import { unwrap } from '../unwrap';

export async function rollbackTicket(id: number, reason: string, target?: string) {
  return unwrap(await client.POST('/api/tickets/{ticketId}/rollback', { ...ticketPath(id), body: { reason, target: target as never } }));
}
