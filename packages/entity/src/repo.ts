/** プロジェクトに属する git のリポジトリ。1 つのリポジトリは、1 つのプロジェクトにだけ属する。 */
export interface Repo {
  readonly id: number;
  readonly projectId: number;
  readonly name: string;
  readonly path: string;
  /** ブランチを切る元 */
  readonly defaultBranch: string;
  /** リモートがあれば、PR を作る */
  readonly hasRemote: boolean;
}
