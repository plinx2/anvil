import { AnvilError } from './errors';

/** チケットの種別。停まる状態の並び(フローの形)を決める。 */
export class Kind {
  /** すべての状態とゲートを通る */
  static readonly STANDARD = new Kind('standard', '標準');
  /** 実現可能性の調査。ブランチも PR も作らない。実装前ゲートで生まれる */
  static readonly SPIKE = new Kind('spike', 'スパイク');

  static readonly all: readonly Kind[] = [Kind.STANDARD, Kind.SPIKE];

  private constructor(
    readonly id: string,
    readonly label: string,
  ) {}

  get isSpike(): boolean {
    return this === Kind.SPIKE;
  }

  static of(id: string): Kind {
    const found = Kind.all.find((k) => k.id === id);
    if (!found) throw AnvilError.invalid(`種別が不正: ${id}`);
    return found;
  }
}
