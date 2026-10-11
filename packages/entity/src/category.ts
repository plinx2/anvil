import { AnvilError } from './errors';

/** 状態のカテゴリ。各カテゴリの終わりに、ゲートの状態がある。 */
export class Category {
  static readonly BEFORE = new Category('before', '着手前');
  static readonly REFINE = new Category('refine', 'リファイン');
  static readonly DESIGN = new Category('design', '設計');
  static readonly IMPLEMENT = new Category('implement', '実装');
  static readonly DONE = new Category('done', '完了');

  static readonly all: readonly Category[] = [Category.BEFORE, Category.REFINE, Category.DESIGN, Category.IMPLEMENT, Category.DONE];

  private constructor(
    readonly id: string,
    readonly label: string,
  ) {}

  static of(id: string): Category {
    const found = Category.all.find((c) => c.id === id);
    if (!found) throw AnvilError.invalid(`カテゴリが不正: ${id}`);
    return found;
  }
}
