import type { Role } from '@anvil/entity';
import type { RequestContext } from '../request-context';

/**
 * ロールの定義(チーム側の型)の置き場。
 * エージェントにファイルを読みに行かせない(作業ディレクトリの外は、許可の確認で止まる)ので、本文を返す。
 */
export interface RoleDefinitions {
  roleDoc(ctx: RequestContext, role: Role): string;
  codingPrinciples(ctx: RequestContext): string;
}
