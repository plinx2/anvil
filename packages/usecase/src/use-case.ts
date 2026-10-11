import type { RequestContext } from './request-context';

/** ユースケース。1 つの処理を、1 つのクラスにする。必要な ports だけを、コンストラクタで受け取る。 */
export interface UseCase<In, Out> {
  execute(ctx: RequestContext, input: In): Promise<Out>;
}
