/** Map simplefactu HTTP errors to user-facing messages. */

function errnoCodeFromUnknown(e: unknown): string | undefined {
  if (!e || typeof e !== "object") return undefined;
  const err = e as Error & { cause?: unknown; code?: string };
  if (typeof err.code === "string") return err.code;
  const c = err.cause;
  if (c && typeof c === "object" && "code" in c && typeof (c as { code: unknown }).code === "string") {
    return (c as { code: string }).code;
  }
  if (Array.isArray(c) && c[0] && typeof c[0] === "object" && "code" in c[0]) {
    const code = (c[0] as { code?: string }).code;
    if (typeof code === "string") return code;
  }
  return undefined;
}

/**
 * When `fetch` to simplefactu fails before any HTTP response (servicio caído,
 * puerto incorrecto, DNS, etc.). Evita propagar `TypeError: fetch failed` al usuario.
 */
export function formatSimplefactuNetworkError(err: unknown): string {
  const code = errnoCodeFromUnknown(err);
  if (code === "ECONNREFUSED") {
    return "No se pudo conectar con el API de Verifactu (conexión rechazada). Comprueba que el servicio simplefactu está en marcha y que SIMPLEFACTU_API_BASE_URL apunta al host y puerto correctos (en local, el API suele ir en un puerto y Next en otro; ver AGENTS.md).";
  }
  if (code === "ENOTFOUND") {
    return "No se pudo resolver el host del API de Verifactu. Revisa SIMPLEFACTU_API_BASE_URL.";
  }
  if (code === "ETIMEDOUT" || code === "ECONNRESET") {
    return "La conexión con el API de Verifactu se cortó o expiró. Inténtalo de nuevo.";
  }
  return "No se pudo contactar con el API de Verifactu. Revisa la red e inténtalo de nuevo.";
}

function isLikelyNetworkFetchFailure(e: unknown): boolean {
  if (!(e instanceof Error)) return false;
  if (e instanceof TypeError && e.message === "fetch failed") return true;
  const code = errnoCodeFromUnknown(e);
  return (
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    code === "ETIMEDOUT" ||
    code === "ECONNRESET" ||
    code === "UND_ERR_CONNECT_TIMEOUT"
  );
}

/**
 * Cualquier fallo al hablar con simplefactu (red, timeout, errores lanzados desde provision/admin).
 * Para usar en server actions: evita 500 y muestra mensaje en la UI.
 */
export function formatVerifactuActionError(e: unknown): string {
  if (isLikelyNetworkFetchFailure(e)) return formatSimplefactuNetworkError(e);
  if (e instanceof Error && e.message.trim()) return e.message.trim().slice(0, 500);
  return formatSimplefactuNetworkError(e);
}

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
