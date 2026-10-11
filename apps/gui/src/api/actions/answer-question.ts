import { client } from '../client';
import { ticketPath } from '../ticket-path';
import { unwrap } from '../unwrap';

export async function answerQuestion(id: number, answer: string) {
  return unwrap(await client.POST('/api/tickets/{ticketId}/answer', { ...ticketPath(id), body: { answer } }));
}
