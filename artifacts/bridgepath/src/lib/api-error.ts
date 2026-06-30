/** Best-effort message from API client errors where `data` is typed as `unknown`. */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (typeof err !== "object" || err === null || !("data" in err)) return fallback;
  const data = (err as { data: unknown }).data;
  if (typeof data !== "object" || data === null || !("message" in data)) return fallback;
  const msg = (data as { message: unknown }).message;
  return typeof msg === "string" && msg.trim() ? msg : fallback;
}
