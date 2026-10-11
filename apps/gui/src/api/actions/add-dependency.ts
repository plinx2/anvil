import { client } from '../client';
import { ticketPath } from '../ticket-path';
import { unwrap } from '../unwrap';

export async function addDependency(id: number, dependsOnId: number) {
  return unwrap(await client.POST('/api/tickets/{ticketId}/dependencies', { ...ticketPath(id), body: { dependsOnId } }));
}
