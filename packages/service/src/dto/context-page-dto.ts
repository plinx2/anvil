import type { ContextPage } from '@anvil/usecase';
import { z } from 'zod';

export const ContextPageDtoSchema = z.object({ path: z.string(), content: z.string() });
export type ContextPageDto = z.infer<typeof ContextPageDtoSchema>;

export function toContextPageDto(page: ContextPage): ContextPageDto {
  return { path: page.path, content: page.content };
}
