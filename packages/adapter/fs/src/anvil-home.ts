import os from 'node:os';
import path from 'node:path';

/** anvil のデータ領域。Windows は %LOCALAPPDATA%\anvil、それ以外は ~/.local/share/anvil。ANVIL_HOME で変えられる。 */
export function anvilHome(env: NodeJS.ProcessEnv = process.env): string {
  if (env.ANVIL_HOME) return env.ANVIL_HOME;
  if (process.platform === 'win32') {
    return path.join(env.LOCALAPPDATA ?? path.join(os.homedir(), 'AppData', 'Local'), 'anvil');
  }
  return path.join(os.homedir(), '.local', 'share', 'anvil');
}
