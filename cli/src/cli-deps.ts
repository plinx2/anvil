import { AnvilError } from '@anvil/entity';
import type { AnvilService, RequestContext } from '@anvil/service';

/** コマンドが使うもの。入口(main.ts、テスト)が渡す。 */
export interface CliDeps {
  service: AnvilService;
  /** 人間の文脈(コマンドを使うのは人間) */
  ctx: RequestContext;
  /** ビルドした GUI の置き場。`serve` が、HTTP API と一緒に配信する(無ければ、配信しない) */
  guiDir?: string;
  /** 結果を出す */
  print(text: string): void;
  /** 失敗を知らせる(main.ts は、メッセージを出して終了コードを 1 にする。テストは、そのまま投げる) */
  fail(error: unknown): void;
}

/** すべてのコマンドの共通の引数。 */
export const common = {
  json: { type: 'boolean', description: '結果を JSON で出す' },
} as const;

/** 結果を出す。`--json` なら data を JSON で、そうでなければ text(無ければ data を整形したもの)を出す。 */
export function emit(deps: CliDeps, args: { json?: boolean }, data: unknown, text?: string): void {
  deps.print(args.json ? JSON.stringify(data, null, 2) : (text ?? JSON.stringify(data, null, 2)));
}

/** コマンドの実行を包み、失敗を `deps.fail` に渡す。 */
export async function guarded(deps: CliDeps, run: () => Promise<void>): Promise<void> {
  try {
    await run();
  } catch (e) {
    deps.fail(e);
  }
}

/** 整数の番号。citty は文字列で渡すので、ここで変換する。 */
export function toInt(name: string, value: string): number {
  if (!/^-?\d+$/.test(value)) throw AnvilError.invalid(`${name} は整数で指定する: ${value}`);
  return Number(value);
}

export function optInt(name: string, value: string | undefined): number | undefined {
  return value === undefined ? undefined : toInt(name, value);
}

export function toNumber(name: string, value: string): number {
  const n = Number(value);
  if (value.trim() === '' || Number.isNaN(n)) throw AnvilError.invalid(`${name} は数値で指定する: ${value}`);
  return n;
}

/** true / false(citty の enum で受けた文字列)を真偽にする。指定が無ければ undefined。 */
export function toBool(value: string | undefined): boolean | undefined {
  return value === undefined ? undefined : value === 'true';
}

/** カンマ区切りの複数指定(`--repo app,lib`)。citty は、同じオプションを繰り返すと、最後の 1 つだけを残す。 */
export function many(value: string | undefined): string[] | undefined {
  if (value === undefined) return undefined;
  return value
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v !== '');
}

export function manyInt(name: string, value: string | undefined): number[] | undefined {
  return many(value)?.map((v) => toInt(name, v));
}
