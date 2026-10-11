# anvil

**AI 開発チームのための、チケット管理とエージェント間の中継点。** 金床(anvil)の上で AI が槌をふるい、チケット(と、その先のプロダクト)を研ぎ澄ます。人間は出来栄えを確かめ、要所で判断する。

理想は「オーナー(DEV ロールの人間)をもう一人作ること」。要望や要件を伝えると、ロールごとに分かれた AI のエージェントが、リファインメントから設計、実装、動作確認、レビュー、PR まで進める。

## 特徴

- **チケットが状態を流れる**: 状態の遷移とゲート(設計前、実装前、完了前)を anvil が管理する。人間が止まるのは、ゲートと質問の承認待ちだけ。
- **ロールごとのエージェント**: PBI 起票、AC、実装方針、設計、テスト設計、実装、動作確認、レビューなどを、専任のエージェントに分ける。ロール定義は [agents/](agents/)。
- **ステータス変更が中継点**: エージェントがチケットの状態を変えると、anvil が次のロールのエージェントのペインへ送り込む。
- **herdr と Claude Code で動く**: エージェントは herdr のペインで Claude Code として動き、人間はそこへ会話しに行く。
- **カンバンで一覧**: 人間も AI も、同じチケットを GUI、HTTP API、CLI、MCP から扱う。
- **改善し続ける**: 各エージェントが作業の終わりに振り返りを保存し、人間が採否を決めて、ロールの指示や anvil の改善に使う。

## ドキュメント

- [docs/](docs/README.md): anvil の説明。
- [agents/](agents/): エージェントのコンテキスト。ロール定義とコードの原則。実行時に読み込まれる。

**状態**: 動く。状態の流れ、ゲート、フラグ、エントリ、依存、起票の依頼、ブランチ・ワークツリー、振り返り、トランザクション、HTTP API(OpenAPI)、MCP(HTTP)、GUI、コマンドが動く。**herdr でのエージェントの実起動と、実際の PR 作成は、未検証**(既定では何もしない)。

## 動かす

```bash
corepack pnpm install      # pnpm は corepack 経由(mise の shim はブロックされる環境がある)
corepack pnpm build        # GUI(apps/gui/dist)と、anvil コマンド(cli/dist/anvil.mjs)をビルドする
corepack pnpm start        # HTTP API(:4730。GUI も配信する)と、MCP(:4731/mcp)を、turbo が起動する
corepack pnpm anvil board  # サーバーを使わずに、コマンドで直接実行する(ビルドしてから、成果物の bin を動かす)
```

`apps/` のアプリケーションは、互いに依存しない。それぞれ単独でも起動できる(`pnpm --filter @anvil/http-api start`、`@anvil/mcp`)。`cli/` は、それらを組み立てる入口(`anvil serve` で、HTTP API・GUI・MCP をまとめて起動する)。

| コマンド | 内容 |
|---|---|
| `pnpm typecheck` | `tsc -b`(turbo。tsconfig の references で全体を) |
| `pnpm test` | vitest(turbo) |
| `pnpm lint` / `pnpm format` | biome |
| `pnpm gen:api` | OpenAPI を書き出し、GUI のクライアントの型を生成する |
| `pnpm anvil <コマンド>` | すべての操作([docs/interfaces.md](docs/interfaces.md))。`--help` でコマンドごとの使い方、`--json` で JSON 出力 |

| 環境変数 | 意味 | 既定 |
|---|---|---|
| `ANVIL_HOME` | データ領域(DB、ワークツリー、プロジェクトコンテキスト、MCP の設定) | Windows: `%LOCALAPPDATA%\anvil` / 他: `~/.local/share/anvil` |
| `ANVIL_AGENT` | `herdr-claude-cli` で、herdr で Claude Code を実際に動かす(**エージェントを起動する**)。`noop` で何もしない(記録だけ) | `herdr-claude-cli` |
| `ANVIL_PULL_REQUESTS` | `gh-cli` で、`claude -p` と `gh` で実際に PR を作る(リモートのあるリポジトリだけ)。`noop` で作らない | `gh-cli` |
| `ANVIL_HTTP_PORT`、`ANVIL_MCP_PORT` | ポート(127.0.0.1 のみ) | 4730、4731 |
| `ANVIL_GUI_DIR` | GUI のビルドの置き場(HTTP API 単体の起動で使う。`anvil serve` は同梱の `dist/gui` を配信する) | `apps/gui/dist` |
| `ANVIL_AGENTS_DIR` | ロールの定義とコードの原則がある、エージェントのコンテキスト | `agents` |

## 構成

```
packages/
  entity/              ドメインの概念(State、Role、Ticket など。振る舞いを持つオブジェクト)
  usecase/             ユースケース(1 クラス 1 ファイル)と、ports
  service/             サービス、zod の入力と DTO
  adapter/
    sqlite/            永続化、トランザクション
    herdr-claude-cli/  herdr で Claude Code を動かす
    claude-cli/        Claude 固有(MCP の設定、PR 本文、モデル名)
    git-cli/ gh-cli/   ブランチとワークツリー、PR
    fs/ system/ noop/  ファイル、時計と ID、何もしない実装
  composition/         配線(createAnvil)
apps/                  互いに依存しない
  http-api/            HTTP API(1 ルート 1 ファイル)。OpenAPI を出力
  mcp/                 MCP(HTTP。1 ツール 1 ファイル)
  gui/                 React + Vite + shadcn。OpenAPI からクライアントを生成
cli/                   anvil コマンド(1 コマンド 1 ファイル)。apps を組み立てる入口で、apps は cli に依存しない
```

## エージェント(MCP)

anvil がエージェントを起動するとき、チケットとロールをヘッダーに結びつけた MCP の設定(`ANVIL_HOME/mcp/*.json`)を書き、`claude --mcp-config` に渡す。ツール: `anvil_read_ticket`、`anvil_read_entries`、`anvil_add_entry`、`anvil_ask`、`anvil_record_answer`、`anvil_advance`、`anvil_rollback`、`anvil_update_ticket`、`anvil_add_dependency`、`anvil_board`、`anvil_create_ticket`、`anvil_save_reflection`、`anvil_request_intake`(最後の 2 つはロールのエージェントだけ)。

人間が使う Claude から使うときは、結びつきなしで接続する(人間として振る舞い、`ticketId` を渡す。`anvil_start` が使える。ゲートの突破と回答は GUI で行う)。

```bash
claude mcp add --transport http anvil http://127.0.0.1:4731/mcp
```
