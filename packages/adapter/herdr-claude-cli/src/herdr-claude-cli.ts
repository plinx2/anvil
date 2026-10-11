import type { AgentLaunch, AgentRuntime, RequestContext } from '@anvil/usecase';
import { trustFolder } from './claude-trust';
import type { HerdrCli } from './herdr-cli';

/** モデルの段階(standard / light)に対応する、Claude のモデル名。 */
export interface HerdrClaudeModels {
  readonly standard: string;
  readonly light: string;
}

/**
 * herdr(`herdr` コマンド)で、Claude Code を動かす実行環境(実機で未検証。`agent list` の読み取りだけ確認した)。
 * 各コマンドは {"id","result":{...}} の JSON を返す。Claude Code 固有の知識(`--session-id`、`--resume`、`--mcp-config`、`--model`)は、ここに閉じる。
 * 別のエージェント(Copilot、Codex など)は、別の実装として足す。
 */
export class HerdrClaudeCli implements AgentRuntime {
  constructor(
    private readonly models: HerdrClaudeModels,
    private readonly cli: HerdrCli,
    /** anvil のデータ領域。この配下の作業ディレクトリ(ワークツリー)は、起動前に信頼済みにする */
    private readonly trustRoot?: string,
  ) {}

  async launch(_ctx: RequestContext, launch: AgentLaunch): Promise<void> {
    if (this.trustRoot) trustFolder(this.trustRoot, launch.cwd);
    // プロジェクトごとにワークスペース、チケットごとにタブ
    const workspaceId = await this.workspaceIdOf(launch.project, launch.cwd);
    const tab = await this.cli.call([
      'tab',
      'create',
      '--workspace',
      workspaceId,
      '--label',
      launch.label,
      '--cwd',
      launch.cwd,
      '--no-focus',
    ]);
    const paneId = tab.result?.root_pane?.pane_id ?? tab.result?.pane?.pane_id ?? tab.result?.pane_id;
    if (!paneId) throw new Error('herdr: ペインを特定できなかった');

    const session = launch.session.resume ? ['--resume', launch.session.id] : ['--session-id', launch.session.id];
    const model = launch.modelTier.id === 'light' ? this.models.light : this.models.standard;
    try {
      await this.cli.call([
        'agent',
        'start',
        launch.name,
        '--kind',
        'claude',
        '--pane',
        paneId,
        '--',
        ...session,
        '--model',
        model,
        '--mcp-config',
        launch.mcpConfigPath,
        ...launch.addDirs.flatMap((dir) => ['--add-dir', dir]),
      ]);
      await this.cli.call(['agent', 'prompt', launch.name, launch.prompt]);
    } catch (e) {
      // 失敗したペインを残すと、エージェント名が塞がって、再試行も失敗し続ける
      await this.cli.call(['pane', 'close', paneId]).catch(() => undefined);
      throw e;
    }
  }

  async stop(_ctx: RequestContext, name: string): Promise<void> {
    const info = await this.cli.call(['agent', 'get', name]).catch(() => null);
    const paneId = info?.result?.agent?.pane_id ?? info?.result?.pane_id;
    if (paneId) await this.cli.call(['pane', 'close', paneId]).catch(() => undefined);
  }

  async isRunning(_ctx: RequestContext, name: string): Promise<boolean | null> {
    try {
      const list = await this.cli.call(['agent', 'list']);
      return ((list.result?.agents ?? []) as Array<{ name?: string }>).some((a) => a.name === name);
    } catch {
      return null;
    }
  }

  async send(_ctx: RequestContext, name: string, text: string): Promise<void> {
    await this.cli.call(['agent', 'prompt', name, text]);
  }

  async focus(_ctx: RequestContext, name: string): Promise<void> {
    await this.cli.call(['agent', 'focus', name]);
  }

  private async workspaceIdOf(label: string, cwd: string): Promise<string> {
    const list = await this.cli.call(['workspace', 'list']);
    const found = ((list.result?.workspaces ?? []) as Array<{ label?: string; workspace_id: string }>).find((w) => w.label === label);
    if (found) return found.workspace_id;

    const created = await this.cli.call(['workspace', 'create', '--label', label, '--cwd', cwd, '--no-focus']);
    const id = created.result?.workspace?.workspace_id ?? created.result?.workspace_id;
    if (!id) throw new Error('herdr: ワークスペースを作れなかった');
    return id;
  }
}
