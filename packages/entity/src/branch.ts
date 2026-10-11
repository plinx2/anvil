/** チケットが、リポジトリごとに持つブランチとワークツリー。 */
export interface Branch {
  readonly ticketId: number;
  readonly repoName: string;
  readonly branch: string;
  readonly worktreePath: string;
}
