import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { PullRequestBodyWriter, RequestContext } from '@anvil/usecase';
import type { ClaudeModels } from './claude-models';

const run = promisify(execFile);

/** PR 作成担当(背景ロール)。`claude -p` で、材料から PR の本文を作る。軽い仕事なので、light のモデル。 */
export class ClaudeCliPullRequestBodyWriter implements PullRequestBodyWriter {
  constructor(
    private readonly models: ClaudeModels,
    private readonly bin = 'claude',
    /** bin に先立って渡す引数(テストで、node + 偽のスクリプトに差し替えるため) */
    private readonly binArgs: readonly string[] = [],
  ) {}

  async write(_ctx: RequestContext, material: string): Promise<string> {
    const prompt =
      '次の材料から、PR の本文だけを Markdown で書いてください。要約(ペイン、ゲイン、AC)、変更の理由、' +
      `確かめ方、レビュワーへの申し送りを含め、anvil のチケットへのリンクは入れないでください。\n\n${material}`;
    const { stdout } = await run(this.bin, [...this.binArgs, '-p', prompt, '--model', this.models.light], {
      windowsHide: true,
      maxBuffer: 16 * 1024 * 1024,
    });
    return stdout.trim();
  }
}
