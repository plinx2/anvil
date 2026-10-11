import { client } from '../client';
import { unwrap } from '../unwrap';

export async function requestIntake(projectId: number, wish: string, autoGate: boolean) {
  return unwrap(await client.POST('/api/intakes', { body: { projectId, items: [{ wish, autoGate }] } }));
}
