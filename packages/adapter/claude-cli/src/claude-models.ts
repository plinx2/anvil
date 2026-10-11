/** モデルの段階(standard / light)に対応する、Claude のモデル名。 */
export interface ClaudeModels {
  readonly standard: string;
  readonly light: string;
}

/** 基本は Sonnet 5.5、軽い仕事は Haiku 5.5。 */
export const DEFAULT_CLAUDE_MODELS: ClaudeModels = { standard: 'claude-sonnet-5-5', light: 'claude-haiku-5-5' };
