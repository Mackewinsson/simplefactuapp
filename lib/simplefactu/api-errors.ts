/** Map simplefactu HTTP errors to user-facing messages. */

export function formatSimplefactuHttpError(
  status: number,
  body: Record<string, unknown>
): string {
  const msg = (body.message ?? body.error) as string | undefined;

  if (status === 402) {
    return msg && typeof msg === "string"
      ? `Límite del plan: ${msg}`
      : "Se superó el límite del plan en el API Verifactu. Mejora el plan del tenant o inténtalo el mes siguiente.";
  }

  if (status === 429) {
    const retry = body.retryAfterSeconds;
    const base =
      msg && typeof msg === "string"
        ? msg
        : "Demasiadas peticiones al API Verifactu.";
    if (retry != null && typeof retry === "number") {
      return `${base} Reintenta tras ${retry} s.`;
    }
    return base;
  }

  if (msg && typeof msg === "string") return msg;
  return `Verifactu respondió HTTP ${status}`;
}
