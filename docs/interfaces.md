# 入口(CLI、HTTP API、MCP)

anvil の機能は、**3 つの入口のすべてで、同じように使える**(確定)。CLI でできることは、HTTP API でも MCP でもできる。プロジェクトの作成も、3 つとも同じ。

```
CLI ──┐
HTTP API ──┼──▶ AnvilService(@anvil/service)──▶ ユースケース
MCP ──┘
```

入口は、サービスの薄い皮で、判断を持たない。入力の検査(zod)、権限の判断、結果の形は、サービスが決める。そのため、どの入口から呼んでも、結果は同じになる。

## 操作の一覧

対応表の正本は [`packages/service/src/operations.ts`](../packages/service/src/operations.ts)。

| 操作 | CLI(`anvil …`) | HTTP API(operationId) | MCP(ツール) |
|---|---|---|---|
| プロジェクトの登録 | `project create` | `createProject` | `anvil_create_project` |
| プロジェクトの削除 | `project delete` | `deleteProject` | `anvil_delete_project` |
| プロジェクトの一覧 | `project list` | `listProjects` | `anvil_list_projects` |
| リポジトリの登録 | `repo add` | `addRepo` | `anvil_add_repo` |
| リポジトリの更新 | `repo update` | `updateRepo` | `anvil_update_repo` |
| プロジェクトコンテキストを読む | `project context` | `getContextPages` | `anvil_get_context_pages` |
| ダッシュボード | `dashboard` | `dashboard` | `anvil_dashboard` |
| カンバン | `board` | `board` | `anvil_board` |
| 起票 | `ticket create` | `createTicket` | `anvil_create_ticket` |
| チケットの詳細 | `ticket show` | `ticketDetail` | `anvil_read_ticket` |
| チケットの更新 | `ticket update` | `updateTicket` | `anvil_update_ticket` |
| チケットの破棄 | `ticket discard` | `discardTicket` | `anvil_discard_ticket` |
| 依存を足す / 外す | `ticket dependency add` / `remove` | `addDependency` / `removeDependency` | `anvil_add_dependency` / `anvil_remove_dependency` |
| 自動ゲート承認フラグ | `ticket auto-gate` | `setAutoGate` | `anvil_set_auto_gate` |
| エントリの追記 / 読み出し | `ticket entry add` / `ticket entries` | `addEntry` / `listEntries` | `anvil_add_entry` / `anvil_read_entries` |
| 着手(TODO → リファイン) | `ticket start` | `startTicket` | `anvil_start` |
| 次へ進める | `ticket advance` | `advanceTicket` | `anvil_advance` |
| 差し戻し | `ticket rollback` | `rollbackTicket` | `anvil_rollback` |
| 設計前ゲートの突破 | `ticket gate design` | `passPreDesignGate` | `anvil_pass_pre_design_gate` |
| 実装前ゲートの突破 | `ticket gate impl` | `passPreImplGate` | `anvil_pass_pre_impl_gate` |
| 完了前ゲートの突破 | `ticket gate done` | `passPreDoneGate` | `anvil_pass_pre_done_gate` |
| エージェントの起動・再開 | `ticket agent start` | `startAgent` | `anvil_start_agent` |
| エージェントのペインを前面に出す | `ticket agent focus` | `focusAgent` | `anvil_focus_agent` |
| PR の作り直し | `ticket pr rebuild` | `rebuildPr` | `anvil_rebuild_pull_request` |
| 質問(承認待ちフラグを立てる) | `ticket ask` | `askQuestion` | `anvil_ask` |
| 承認待ちへの回答 | `ticket answer` | `answerQuestion` | `anvil_record_answer` |
| 起票の依頼(分割・スパイク) | `intake request` | `requestIntake` | `anvil_request_intake` |
| 起票の依頼の進み具合 | `intake show` | `getIntake` | `anvil_get_intake` |
| 振り返りの一覧 | `reflection list` | `listReflections` | `anvil_list_reflections` |
| 振り返りの採否 | `reflection decide` | `decideReflection` | `anvil_decide_reflection` |
| 振り返りの保存 | — | — | `anvil_save_reflection`(例外) |

### プロジェクトの削除

元に戻せない。取り違えを防ぐため、プロジェクトの名前をそのまま `confirmName` に書く(CLI は `--confirm-name`、HTTP はクエリ、MCP は引数)。名前が `-` で始まるときは、CLI は `--confirm-name=<名前>` と書く。

- **消すもの**: チケット(エントリ、履歴、起動の記録、ブランチの記録、依存、振り返りを含む)、起票の依頼、リポジトリの登録、稼働中のエージェント、ワークツリー、プロジェクトコンテキスト、エージェントに渡した MCP の設定。他のプロジェクトのチケットからの依存も外れる。
- **残すもの**: リポジトリそのもの(ローカルのパス)と、その中のブランチ。未マージの作業を失わないため。残したブランチは、結果と通知に出る。リモートありでは、PR が `MERGED` で先頭コミットが一致すると確かめられたブランチだけ削除する。ワークツリーは、未コミットの変更も含めて消える。

### リポジトリの更新

`hasRemote`、`defaultBranch`、`path` のうち、指定した項目だけを更新する(名前は変えられない)。対象は、プロジェクトの番号とリポジトリの名前で指す。リモートの有無を変えると、完了時の動作(リモートなし: ローカルへ取り込み / あり: pull のあと、マージ済みならブランチ削除)と、PR の作成対象が切り替わる。

- `path` は、実在の検証も、ワークツリーの移し替えもしない(`repo add` と同じ)。ブランチを切り済みのチケットがあるときに `path` を変えると、完了時のワークツリー削除が失敗しうる(通知され、処理は止まらない)。
- `path` が他のリポジトリと重複するときは `conflict`。自分自身の現在の `path` の指定は通す。
- 更新する項目を 1 つも指定しないと `invalid`。

### 例外: 振り返りの保存

ロールのエージェントだけが保存できる(書き手のロールが、振り返りのロールになる)。人間には意味が無く、サービスが拒否するので、ロールに結びついた MCP だけが提供する。ほかの操作に例外は無い。

## 入口ごとの決まり

### 共通

- **番号は整数**。HTTP ではパス、CLI では位置引数、MCP では引数として渡す。
- **エラー**は、サービスの `AnvilError` のコード(`invalid`、`not_found`、`conflict`、`blocked`、`forbidden`)で表す。HTTP は状態コード、CLI は `エラー(<コード>): <メッセージ>` と終了コード 1、MCP は `isError` の応答。
- **リクエストの文脈**(誰の操作か)は、入口が作る。HTTP と CLI は人間。MCP は、結びつきがあればそのロールのエージェント、なければ人間。

### CLI

- `anvil <コマンド> [引数] [--オプション]`。サーバーを使わず、ユースケースを直接実行する。citty で作ってある。
- **bin はビルドの成果物**: `cli/dist/anvil.mjs`(tsdown で、依存も含めて 1 ファイルにまとめる。`node` の組み込み以外に依存しない)。`pnpm build` でビルドし、`pnpm anvil <コマンド>` は、必要ならビルドしてから実行する。
- コマンドは、`ticket gate impl` のように語を重ねる。`anvil ticket --help` のように、群にも `--help` が使える。
- **`--help`** は、コマンドごとに使い方を出す。必須の引数・オプション、`enum` の選択肢(状態、種別など)は、実行前に citty が検査する。整数の番号は、変換できなければ `invalid` で失敗する。
- **`--json`** は、結果を JSON で出す(既定は、人が読む形)。
- **複数指定**は、カンマ区切り(`--repo app,lib`、`--depends-on 1,2`)。citty は、同じオプションを繰り返すと最後の 1 つだけを残すため。
- **true / false** は、値で渡す(`--design-needed false`)。
- 起票の依頼は、1 件なら `--item <やりたいこと>`、複数件や細かい指定は `--items-json '<JSON>'`。
- **未知のオプションは、拒否されない**(citty は読み流す)。打ち間違いに注意する。

### HTTP API

- `127.0.0.1:4730`(`ANVIL_HTTP_PORT`)。パスは `/api/…`。OpenAPI は、`pnpm gen:api` で書き出す。
- 認証は無い(127.0.0.1 のみで待ち受ける)。

### MCP

- `127.0.0.1:4731/mcp`(`ANVIL_MCP_PORT`)。Streamable HTTP。
- **ロールのエージェント**(ヘッダー `x-anvil-ticket`、`x-anvil-role` で結びつく)には、自分のチケットに対する次のツールだけを出す。`ticketId` の引数は出さない(他のチケットを指せない)。

  `anvil_read_ticket`、`anvil_read_entries`、`anvil_add_entry`、`anvil_ask`、`anvil_record_answer`、`anvil_advance`、`anvil_rollback`、`anvil_update_ticket`、`anvil_add_dependency`、`anvil_board`、`anvil_create_ticket`、`anvil_request_intake`、`anvil_save_reflection`
- **結びつきの無い接続**(人間が使う Claude)には、**すべての操作**を出す。ゲートの突破、プロジェクトの管理、振り返りの採否なども、ここから行える。ゲートの判断をエージェントにさせない、という原則のために、これらはロールのエージェントには出さない。

## 操作を足すとき

1. サービスにメソッドを足す。
2. [`operations.ts`](../packages/service/src/operations.ts) に 1 行足す。
3. CLI のコマンド、HTTP のルート、MCP のツールを、それぞれ足す。

足し忘れは、テストが検出する。

- `packages/composition/test/operations.test.ts`: サービスのすべてのメソッドが、一覧に載っているか。
- `cli/test`、`apps/http-api/test`、`apps/mcp/test`: それぞれの入口が、一覧のすべてを提供しているか(MCP は、人間の接続に出るツールが一覧と一致するか)。
