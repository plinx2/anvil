import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);

/** anvil 専用の herdr のセッション名(プロジェクトごとのワークスペースを、この 1 つのセッションにまとめる) */
export const DEFAULT_HERDR_SESSION = 'anvil';

/** herdr の組み込みの既定セッション(`--session` を付けない) */
const BUILT_IN_SESSION = 'default';

/**
 * `herdr` コマンドの呼び出し。専用のセッションを使い、そのサーバーが動いていなければ、切り離して起動する。
 * セッション名は、ASCII の英数字と . _ - だけ(64 バイトまで)。
 */
export class HerdrCli {
  private starting: Promise<void> | null = null;

  constructor(
    private readonly session: string = DEFAULT_HERDR_SESSION,
    private readonly bin: string = process.env.HERDR_BIN ?? 'herdr',
    /** bin に先立って渡す引数(テストで、node + 偽の herdr のスクリプトに差し替えるため) */
    private readonly binArgs: readonly string[] = [],
  ) {}

  /** コマンドを実行して、JSON の応答を返す。サーバーが無ければ、起動して 1 回だけやり直す */
  async call(args: string[]): Promise<any> {
    try {
      return await this.exec(args);
    } catch (e) {
      if (!isServerNotRunning(e)) throw e;
      await this.startServer();
      return await this.exec(args);
    }
  }

  private async exec(args: string[]): Promise<any> {
    const prefix = this.session === BUILT_IN_SESSION ? [] : ['--session', this.session];
    const { stdout } = await run(this.bin, [...this.binArgs, ...prefix, ...args], { maxBuffer: 16 * 1024 * 1024, windowsHide: true });
    const text = stdout.trim();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return { raw: text };
    }
  }

  /** ヘッドレスのサーバーを、anvil から切り離して起動し、応答するまで待つ(anvil を止めても、エージェントは残る) */
  private startServer(): Promise<void> {
    this.starting ??= (async () => {
      const child = spawn(this.bin, [...this.binArgs, '--session', this.session, 'server'], {
        detached: true,
        stdio: 'ignore',
        windowsHide: true,
      });
      child.unref();
      for (let i = 0; i < 40; i++) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        try {
          await this.exec(['workspace', 'list']);
          return;
        } catch (e) {
          if (!isServerNotRunning(e)) throw e;
        }
      }
      throw new Error(`herdr: セッション ${this.session} のサーバーを起動できなかった`);
    })().finally(() => {
      this.starting = null;
    });
    return this.starting;
  }
}

function isServerNotRunning(e: unknown): boolean {
  const { message = '', stdout = '', stderr = '' } = e as { message?: string; stdout?: string; stderr?: string };
  return `${message}${stdout}${stderr}`.includes('server_not_running');
}
