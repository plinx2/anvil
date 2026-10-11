export class ApiError extends Error {}

export function unwrap<T>(r: { data?: T; error?: unknown }): T {
  if (r.data === undefined) {
    const e = r.error as { error?: string } | undefined;
    throw new ApiError(e?.error ?? 'リクエストに失敗した');
  }
  return r.data;
}
