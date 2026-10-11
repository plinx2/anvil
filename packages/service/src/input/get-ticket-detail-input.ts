import { z } from 'zod';

/** チケットの詳細を読む */
export const GetTicketDetailInputSchema = z.object({ ticketId: z.number().int() });
export type GetTicketDetailInput = z.input<typeof GetTicketDetailInputSchema>;
