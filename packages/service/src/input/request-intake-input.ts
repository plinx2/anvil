import { z } from 'zod';
import { KindIdSchema } from '../dto/kind-id';
import { StateIdSchema } from '../dto/state-id';

export const RequestIntakeInputSchema = z.object({
  /** 元のチケット(分割・スパイク)。GUI の起票ボタンからの依頼には無い */
  sourceTicketId: z.number().int().optional(),
  projectId: z.number().int().optional(),
  /** 全部起票された後に、元を破棄するか。しないなら、元が新しいチケットすべてに依存する */
  discard: z.boolean().optional(),
  items: z.array(
    z.object({
      /** やりたいこと。分割元の関連情報(分割理由、割り振る AC)も含める */
      wish: z.string(),
      kind: KindIdSchema.optional(),
      startState: StateIdSchema.optional(),
      slug: z.string().optional(),
      autoGate: z.boolean().optional(),
      dependsOn: z.array(z.number().int()).optional(),
    }),
  ),
});
export type RequestIntakeInput = z.input<typeof RequestIntakeInputSchema>;
