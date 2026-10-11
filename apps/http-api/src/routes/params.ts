import { z } from '@hono/zod-openapi';

/** パスやクエリの番号。URL からは文字列で届くので、整数の文字列を受けて、数値にする。 */
export const IdParam = z.string().regex(/^\d+$/, '整数').transform(Number);

export const TicketIdParams = z.object({ ticketId: IdParam });
export const ProjectIdParams = z.object({ projectId: IdParam });
export const IntakeIdParams = z.object({ intakeId: IdParam });
export const ReflectionIdParams = z.object({ reflectionId: IdParam });
