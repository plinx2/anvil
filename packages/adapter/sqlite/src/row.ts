/** SQLite から返る 1 行(列名 → 値)。 */
export type Row = Record<string, any>;

/** SQLite は真偽値を 0 / 1 で持つ。 */
export const toBool = (value: unknown): boolean => value === 1;
export const fromBool = (value: boolean): number => (value ? 1 : 0);
