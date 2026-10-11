/**
 * anvil の操作の一覧。**CLI、HTTP API、MCP は、すべての操作を提供する**(確定)。
 * ここが、その対応表。各入口のテストが、この表のすべてを提供しているか検査する。
 * 操作を足すときは、サービスにメソッドを足し、ここに 1 行足し、3 つの入口すべてに足す。
 */
export interface Operation {
  /** サービスの操作。`<サービス>.<メソッド>` */
  readonly id: string;
  readonly summary: string;
  /** HTTP API の operationId。null は、この入口では提供しない */
  readonly http: string | null;
  /** MCP のツール名 */
  readonly mcp: string;
  /** コマンド名(`anvil` の後)。null は、この入口では提供しない */
  readonly cli: string | null;
}

export const OPERATIONS: readonly Operation[] = [
  // プロジェクト
  { id: 'projects.create', summary: 'プロジェクトの登録', http: 'createProject', mcp: 'anvil_create_project', cli: 'project create' },
  { id: 'projects.delete', summary: 'プロジェクトの削除', http: 'deleteProject', mcp: 'anvil_delete_project', cli: 'project delete' },
  { id: 'projects.list', summary: 'プロジェクトの一覧', http: 'listProjects', mcp: 'anvil_list_projects', cli: 'project list' },
  { id: 'projects.addRepo', summary: 'リポジトリの登録', http: 'addRepo', mcp: 'anvil_add_repo', cli: 'repo add' },
  {
    id: 'projects.contextPages',
    summary: 'プロジェクトコンテキストを読む',
    http: 'getContextPages',
    mcp: 'anvil_get_context_pages',
    cli: 'project context',
  },
  // ダッシュボード、カンバン
  { id: 'dashboard.show', summary: 'ダッシュボード', http: 'dashboard', mcp: 'anvil_dashboard', cli: 'dashboard' },
  { id: 'tickets.board', summary: 'チケットの一覧(カンバン)', http: 'board', mcp: 'anvil_board', cli: 'board' },
  // チケット
  { id: 'tickets.create', summary: '起票', http: 'createTicket', mcp: 'anvil_create_ticket', cli: 'ticket create' },
  { id: 'tickets.detail', summary: 'チケットの詳細', http: 'ticketDetail', mcp: 'anvil_read_ticket', cli: 'ticket show' },
  { id: 'tickets.update', summary: 'チケットの更新', http: 'updateTicket', mcp: 'anvil_update_ticket', cli: 'ticket update' },
  { id: 'tickets.discard', summary: 'チケットの破棄', http: 'discardTicket', mcp: 'anvil_discard_ticket', cli: 'ticket discard' },
  { id: 'tickets.addDependency', summary: '依存を足す', http: 'addDependency', mcp: 'anvil_add_dependency', cli: 'ticket dependency add' },
  {
    id: 'tickets.removeDependency',
    summary: '依存を外す',
    http: 'removeDependency',
    mcp: 'anvil_remove_dependency',
    cli: 'ticket dependency remove',
  },
  {
    id: 'tickets.changeAutoGate',
    summary: '自動ゲート承認フラグの切り替え',
    http: 'setAutoGate',
    mcp: 'anvil_set_auto_gate',
    cli: 'ticket auto-gate',
  },
  { id: 'tickets.appendEntry', summary: 'エントリの追記', http: 'addEntry', mcp: 'anvil_add_entry', cli: 'ticket entry add' },
  { id: 'tickets.entries', summary: 'エントリを読む', http: 'listEntries', mcp: 'anvil_read_entries', cli: 'ticket entries' },
  // 状態の流れ
  { id: 'flow.start', summary: '着手(TODO → リファイン)', http: 'startTicket', mcp: 'anvil_start', cli: 'ticket start' },
  { id: 'flow.advance', summary: '次の状態へ進める', http: 'advanceTicket', mcp: 'anvil_advance', cli: 'ticket advance' },
  { id: 'flow.rollback', summary: '差し戻し', http: 'rollbackTicket', mcp: 'anvil_rollback', cli: 'ticket rollback' },
  {
    id: 'flow.passDesignGate',
    summary: '設計前ゲートの突破',
    http: 'passPreDesignGate',
    mcp: 'anvil_pass_pre_design_gate',
    cli: 'ticket gate design',
  },
  {
    id: 'flow.passImplGate',
    summary: '実装前ゲートの突破',
    http: 'passPreImplGate',
    mcp: 'anvil_pass_pre_impl_gate',
    cli: 'ticket gate impl',
  },
  {
    id: 'flow.passDoneGate',
    summary: '完了前ゲートの突破',
    http: 'passPreDoneGate',
    mcp: 'anvil_pass_pre_done_gate',
    cli: 'ticket gate done',
  },
  { id: 'flow.startAgentOf', summary: 'エージェントの起動・再開', http: 'startAgent', mcp: 'anvil_start_agent', cli: 'ticket agent start' },
  {
    id: 'flow.focusAgentOf',
    summary: 'エージェントのペインを前面に出す',
    http: 'focusAgent',
    mcp: 'anvil_focus_agent',
    cli: 'ticket agent focus',
  },
  { id: 'flow.rebuildPr', summary: 'PR の作り直し', http: 'rebuildPr', mcp: 'anvil_rebuild_pull_request', cli: 'ticket pr rebuild' },
  // 承認待ちフラグ
  { id: 'flags.ask', summary: '承認待ちフラグを立てて質問する', http: 'askQuestion', mcp: 'anvil_ask', cli: 'ticket ask' },
  { id: 'flags.answer', summary: '承認待ちフラグへの回答', http: 'answerQuestion', mcp: 'anvil_record_answer', cli: 'ticket answer' },
  // 起票の依頼
  {
    id: 'intakes.request',
    summary: '起票の依頼(分割・スパイク)',
    http: 'requestIntake',
    mcp: 'anvil_request_intake',
    cli: 'intake request',
  },
  { id: 'intakes.progress', summary: '起票の依頼の進み具合', http: 'getIntake', mcp: 'anvil_get_intake', cli: 'intake show' },
  // 振り返り
  { id: 'reflections.list', summary: '振り返りの一覧', http: 'listReflections', mcp: 'anvil_list_reflections', cli: 'reflection list' },
  {
    id: 'reflections.decide',
    summary: '振り返りの採否',
    http: 'decideReflection',
    mcp: 'anvil_decide_reflection',
    cli: 'reflection decide',
  },
  /**
   * 例外: 振り返りの保存は、ロールのエージェントだけ(書き手のロールが、振り返りのロールになる。サービスが人間を拒否する)。
   * ロールに結びついた MCP だけが提供する。
   */
  { id: 'reflections.save', summary: '振り返りの保存(ロールのエージェントだけ)', http: null, mcp: 'anvil_save_reflection', cli: null },
];
