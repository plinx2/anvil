import { useQuery } from '@tanstack/react-query';
import { client } from '../client';
import { unwrap } from '../unwrap';

export function useContextPages(projectId: number, enabled: boolean) {
  return useQuery({
    queryKey: ['context', projectId],
    enabled,
    queryFn: async () =>
      unwrap(await client.GET('/api/projects/{projectId}/context', { params: { path: { projectId: String(projectId) } } })),
  });
}
