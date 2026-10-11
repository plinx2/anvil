export type ErrorCode = 'invalid' | 'not_found' | 'conflict' | 'forbidden' | 'blocked';

/** anvil の業務上のエラー。transport(HTTP、MCP、コマンド)が、コードから応答に変換する。 */
export class AnvilError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'AnvilError';
  }

  /** 入力が不正 */
  static invalid(message: string) {
    return new AnvilError('invalid', message);
  }

  static notFound(message: string) {
    return new AnvilError('not_found', message);
  }

  /** 重複、状態の食い違い */
  static conflict(message: string) {
    return new AnvilError('conflict', message);
  }

  static forbidden(message: string) {
    return new AnvilError('forbidden', message);
  }

  /** 業務上の規則で、今はできない(依存先が未完了、承認待ち、など) */
  static blocked(message: string) {
    return new AnvilError('blocked', message);
  }
}
