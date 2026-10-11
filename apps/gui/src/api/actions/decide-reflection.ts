import { client } from '../client';
import { unwrap } from '../unwrap';

export async function decideReflection(id: number, status: 'adopted' | 'rejected' | 'pending', reason?: string) {
  return unwrap(
    await client.POST('/api/reflections/{reflectionId}/decision', {
      params: { path: { reflectionId: String(id) } },
      body: { status, reason },
    }),
  );
}
