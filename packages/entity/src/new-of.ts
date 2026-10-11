/** 保存する前の形(番号は、保存する側が付ける)。 */
export type NewOf<T extends { id: number }> = Omit<T, 'id'>;
