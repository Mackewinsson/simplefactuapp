/** Map simplefactu HTTP errors to user-facing messages. */

export function formatSimplefactuHttpError(
  status: number,
  body: Record<string, unknown>
): string {
  const msg = (body.message ?? body.error) as string | undefined;

  if (status === 402) {
    return msg && typeof msg === "string"
      ? `Plan limit: ${msg}`
      : "Plan limit exceeded on the Verifactu API. Upgrade the tenant plan or try again next month.";
  }

  if (status === 429) {
    const retry = body.retryAfterSeconds;
    const base =
      msg && typeof msg === "string" ? msg : "Too many requests to the Verifactu API.";
    if (retry != null && typeof retry === "number") {
      return `${base} Retry after ${retry}s.`;
    }
    return base;
  }

  if (msg && typeof msg === "string") return msg;
  return `Verifactu returned HTTP ${status}`;
}
