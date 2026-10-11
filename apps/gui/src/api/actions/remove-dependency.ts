import { client } from '../client';
import { unwrap } from '../unwrap';

export async function removeDependency(id: number, dependsOnId: number) {
  return unwrap(
    await client.DELETE('/api/tickets/{ticketId}/dependencies/{dependsOnId}', {
      params: { path: { ticketId: String(id), dependsOnId: String(dependsOnId) } },
    }),
  );
}
