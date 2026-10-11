import { useQuery } from '@tanstack/react-query';
import { client } from '../client';
import { unwrap } from '../unwrap';
import { POLL } from './poll';

export function useDashboard() {
  return useQuery({ queryKey: ['dashboard'], queryFn: async () => unwrap(await client.GET('/api/dashboard')), refetchInterval: POLL });
}
