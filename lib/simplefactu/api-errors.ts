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
    return "No se pudo conectar con el servicio de registro Verifactu (conexión rechazada). Comprueba que el servicio está en marcha y que la URL configurada para el entorno apunta al host y puerto correctos (en desarrollo local, la app y el servicio de registro suelen usar puertos distintos).";
  }
  if (code === "ENOTFOUND") {
    return "No se pudo resolver el host del servicio de registro Verifactu. Revisa la URL configurada en el entorno.";
  }
  if (code === "ETIMEDOUT" || code === "ECONNRESET") {
    return "La conexión con el servicio de registro Verifactu se cortó o expiró. Inténtalo de nuevo.";
  }
  return "No se pudo contactar con el servicio de registro Verifactu. Revisa la red e inténtalo de nuevo.";
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
const ADMIN_KEY_MISMATCH_HINT =
  "Comprueba que SIMPLEFACTU_ADMIN_KEY (Vercel) coincide con ADMIN_KEY del API en el mismo entorno (QA con QA, producción con producción).";

function expandAdminKeyMessage(msg: string): string {
  const lower = msg.toLowerCase();
  if (
    lower.includes("admin key") ||
    lower.includes("x-admin-key") ||
    lower.includes("simplefactu_admin_key") ||
    (lower.includes("401") && lower.includes("admin"))
  ) {
    return `${msg} ${ADMIN_KEY_MISMATCH_HINT}`;
  }
  return msg;
}

export function formatVerifactuActionError(e: unknown): string {
  if (isLikelyNetworkFetchFailure(e)) return formatSimplefactuNetworkError(e);
  if (e instanceof Error && e.message.trim()) {
    return expandAdminKeyMessage(e.message.trim().slice(0, 500));
  }
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
      : "Se superó el límite del plan en Verifactu. Mejora tu plan o inténtalo el mes siguiente.";
  }

  if (status === 429) {
    const retry = body.retryAfterSeconds;
    const base =
      msg && typeof msg === "string"
        ? msg
        : "Demasiadas peticiones al servicio de registro Verifactu.";
    if (retry != null && typeof retry === "number") {
      return `${base} Reintenta tras ${retry} s.`;
    }
    return base;
  }

  if (msg && typeof msg === "string") return msg;
  return `Verifactu respondió HTTP ${status}`;
}
