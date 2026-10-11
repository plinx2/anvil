import { client } from '../client';
import { ticketPath } from '../ticket-path';
import { unwrap } from '../unwrap';

export async function passPreImplGate(id: number) {
  return unwrap(await client.POST('/api/tickets/{ticketId}/gates/pre-impl', ticketPath(id)));
}
