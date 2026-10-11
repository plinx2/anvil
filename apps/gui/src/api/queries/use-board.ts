import { useQuery } from '@tanstack/react-query';
import { client } from '../client';
import { unwrap } from '../unwrap';
import { POLL } from './poll';

export function useBoard(projectId?: number) {
  return useQuery({
    queryKey: ['board', projectId ?? 'all'],
    queryFn: async () =>
      unwrap(await client.GET('/api/board', { params: { query: { projectId: projectId === undefined ? undefined : String(projectId) } } })),
    refetchInterval: POLL,
  });
}
