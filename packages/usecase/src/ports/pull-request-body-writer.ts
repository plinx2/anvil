import type { RequestContext } from '../request-context';

/** PR の本文を書く背景ロール(PR 作成担当)。材料から、本文を作る。 */
export interface PullRequestBodyWriter {
  write(ctx: RequestContext, material: string): Promise<string>;
}
