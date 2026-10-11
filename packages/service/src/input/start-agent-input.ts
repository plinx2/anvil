import { z } from 'zod';

/** 動いていないエージェントを起動・再開する */
export const StartAgentInputSchema = z.object({ ticketId: z.number().int() });
export type StartAgentInput = z.input<typeof StartAgentInputSchema>;
