import { AnvilError } from './errors';

/**
 * モデルの段階。製品のモデル名ではない(モデル名への対応は、各エージェントの実装が持つ)。
 * 基本は standard(Sonnet 5.5)。軽い仕事だけ light(Haiku 5.5)。
 */
export class ModelTier {
  static readonly STANDARD = new ModelTier('standard');
  static readonly LIGHT = new ModelTier('light');

  static readonly all: readonly ModelTier[] = [ModelTier.STANDARD, ModelTier.LIGHT];

  private constructor(readonly id: string) {}

  static of(id: string): ModelTier {
    const found = ModelTier.all.find((t) => t.id === id);
    if (!found) throw AnvilError.invalid(`モデルの段階が不正: ${id}`);
    return found;
  }
}
