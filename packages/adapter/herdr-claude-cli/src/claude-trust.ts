import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/** Claude Code のグローバル設定。CLAUDE_CONFIG_DIR があれば、その下 */
function claudeConfigFile(env: NodeJS.ProcessEnv): string {
  return path.join(env.CLAUDE_CONFIG_DIR ?? os.homedir(), '.claude.json');
}

function isInside(root: string, target: string): boolean {
  const relative = path.relative(path.resolve(root), path.resolve(target));
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
}

/**
 * Claude Code の「このフォルダを信頼しますか」を、エージェントの起動前に済ませる(実機の確認で止まらないように)。
 * 信頼は、グローバル設定の projects["<パス>"].hasTrustDialogAccepted に、パスごとに記録される。
 * 信頼するのは、`root`(anvil のデータ領域。ワークツリーの置き場)の配下だけ。利用者のリポジトリは、勝手に信頼しない。
 * 設定を読めない、壊れているときは、何も書かない(確認が出るだけで、設定は壊さない)。
 * @returns 信頼を登録した(すでに信頼済みも含む)なら true
 */
export function trustFolder(root: string, cwd: string, env: NodeJS.ProcessEnv = process.env): boolean {
  if (!isInside(root, cwd)) return false;
  const file = claudeConfigFile(env);
  try {
    const config = JSON.parse(fs.readFileSync(file, 'utf8')) as { projects?: Record<string, Record<string, unknown>> };
    const key = path.resolve(cwd).replace(/\\/g, '/');
    config.projects ??= {};
    const projects = config.projects;
    if (projects[key]?.hasTrustDialogAccepted === true) return true;
    projects[key] = { ...projects[key], hasTrustDialogAccepted: true };
    const tmp = `${file}.anvil-${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(config, null, 2));
    fs.renameSync(tmp, file);
    return true;
  } catch {
    return false;
  }
}
