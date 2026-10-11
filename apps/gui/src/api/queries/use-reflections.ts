import { useQuery } from '@tanstack/react-query';
import { client } from '../client';
import { unwrap } from '../unwrap';
import { POLL } from './poll';

export function useReflections(filter: { status?: string; target?: string; role?: string }) {
  return useQuery({
    queryKey: ['reflections', filter],
    queryFn: async () => unwrap(await client.GET('/api/reflections', { params: { query: filter as never } })),
    refetchInterval: POLL,
  });
}
