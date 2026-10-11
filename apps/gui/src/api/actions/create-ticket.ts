import { client } from '../client';
import { unwrap } from '../unwrap';

export async function createTicket(projectId: number, title: string, body: string, autoGate: boolean) {
  return unwrap(await client.POST('/api/tickets', { body: { projectId, title, body, autoGate } }));
}
