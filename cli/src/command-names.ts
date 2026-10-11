import type { CommandDef } from 'citty';

/** コマンドの木にあるコマンド(葉)の名前の一覧。例: `ticket gate impl`。 */
export function commandNames(command: CommandDef<any>, prefix: string[] = []): string[] {
  const subs = command.subCommands as Record<string, CommandDef<any>> | undefined;
  if (!subs || Object.keys(subs).length === 0) return [prefix.join(' ')];
  return Object.entries(subs).flatMap(([name, sub]) => commandNames(sub, [...prefix, name]));
}
