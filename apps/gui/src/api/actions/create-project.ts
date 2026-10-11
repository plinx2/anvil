import { client } from '../client';
import { unwrap } from '../unwrap';

export async function createProject(name: string) {
  return unwrap(await client.POST('/api/projects', { body: { name } }));
}
