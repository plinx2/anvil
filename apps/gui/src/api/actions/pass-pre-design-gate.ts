import { client } from '../client';
import { ticketPath } from '../ticket-path';
import { unwrap } from '../unwrap';

export async function passPreDesignGate(id: number, sp: number) {
  return unwrap(await client.POST('/api/tickets/{ticketId}/gates/pre-design', { ...ticketPath(id), body: { sp } }));
}
