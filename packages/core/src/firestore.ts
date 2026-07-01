/** Remove `undefined` values recursively — Firestore rejects undefined fields. */
export function stripUndefined<T>(value: T): T {
  if (value === undefined || value === null || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item)) as T;
  }

  const out: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value)) {
    if (nested !== undefined) {
      out[key] = stripUndefined(nested);
    }
  }
  return out as T;
}
