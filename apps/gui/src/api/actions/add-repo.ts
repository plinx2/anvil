import { client } from '../client';
import { unwrap } from '../unwrap';

export async function addRepo(projectId: number, body: { name: string; path: string; defaultBranch?: string; hasRemote?: boolean }) {
  return unwrap(await client.POST('/api/projects/{projectId}/repos', { params: { path: { projectId: String(projectId) } }, body }));
}
