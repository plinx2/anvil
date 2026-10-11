import { useQuery } from '@tanstack/react-query';
import { client } from '../client';
import { ticketPath } from '../ticket-path';
import { unwrap } from '../unwrap';
import { POLL } from './poll';

export function useTicket(id: number) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => unwrap(await client.GET('/api/tickets/{ticketId}', ticketPath(id))),
    refetchInterval: POLL,
  });
}
