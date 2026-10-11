/** 起票の依頼(分割・スパイク共通)。 */
export interface Intake {
  readonly id: number;
  readonly projectId: number;
  /** 元のチケット。GUI の起票ボタンからの依頼には無い */
  readonly sourceTicketId: number | null;
  /** 全部起票された後に、元を破棄するか。しないなら、元が新しいチケットすべてに依存する */
  readonly discard: boolean;
  readonly status: 'open' | 'done';
  readonly createdAt: string;
}
