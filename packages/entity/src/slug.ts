/** チケットの slug。ブランチ名になる。 */
// biome-ignore lint/complexity/noStaticOnlyClass: slug に関する処理を、概念のオブジェクトにまとめる
export class Slug {
  private static readonly PATTERN = /^[A-Za-z0-9][A-Za-z0-9._/-]*$/;

  static isValid(value: string): boolean {
    return Slug.PATTERN.test(value);
  }

  /** タイトルから、候補を作る。ASCII が取れなければ空文字(呼び出し側で、番号にする)。 */
  static candidateFrom(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48);
  }
}
