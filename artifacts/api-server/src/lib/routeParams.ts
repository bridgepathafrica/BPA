/** Express 5 typings: `req.params.*` may be `string | string[]`. */
export function paramString(value: string | string[] | undefined): string {
  if (value == null) return "";
  return Array.isArray(value) ? (value[0] ?? "") : value;
}

export function paramInt(value: string | string[] | undefined): number {
  return parseInt(paramString(value), 10);
}
