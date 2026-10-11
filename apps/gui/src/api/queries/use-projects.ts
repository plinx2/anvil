import { useQuery } from '@tanstack/react-query';
import { client } from '../client';
import { unwrap } from '../unwrap';
import { POLL } from './poll';

export function useProjects() {
  return useQuery({ queryKey: ['projects'], queryFn: async () => unwrap(await client.GET('/api/projects')), refetchInterval: POLL });
}
