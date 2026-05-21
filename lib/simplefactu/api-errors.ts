/** Map simplefactu HTTP errors to user-facing messages. */

import { humanizeAeatError } from "@/lib/simplefactu/aeat-error-messages";

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

function formatValidationDetails(body: Record<string, unknown>): string | null {
  const details = body.details;
  if (!Array.isArray(details) || details.length === 0) return null;
  const parts = details
    .map((d) => {
      if (!d || typeof d !== "object") return null;
      const row = d as { field?: string; message?: string; msg?: string };
      const text = row.message ?? row.msg;
      if (!text || typeof text !== "string") return null;
      return row.field ? `${row.field}: ${text}` : text;
    })
    .filter((s): s is string => Boolean(s));
  return parts.length ? parts.join(" ") : null;
}

function formatAllowedNifMessage(raw: string): string | null {
  const match = raw.match(/solo puede emitir facturas para el NIF\s+([A-Z0-9]+)/i);
  if (!match) return null;
  const nif = match[1].toUpperCase();
  return `Solo puedes emitir facturas con el NIF ${nif}. Ve a Ajustes → Verifactu y comprueba que el NIF del emisor coincide con tu certificado digital.`;
}

function formatChainError(body: Record<string, unknown>): string | null {
  const errType = body.error;
  const msg = body.message;
  if (typeof msg !== "string" || !msg.trim()) return null;

  if (errType === "Chain Continuity Error") {
    return `Encadenamiento roto: la huella de la factura anterior no coincide con la última registrada en AEAT. ${msg} Si acabas de cambiar de certificado o de serie, contacta soporte.`;
  }
  if (errType === "Chain State Error") {
    if (/primer registro|primerregistro|already exists/i.test(msg)) {
      return "Esta serie ya tiene facturas registradas en AEAT. No marques «primer registro» si no es la primera factura de la serie.";
    }
    return `Estado de la cadena de facturación incorrecto: ${msg}`;
  }
  if (errType === "NumeroInstalacion Conflict") {
    return "Conflicto de instalación del software de facturación. Contacta soporte: los datos del sistema informático no coinciden con los registrados.";
  }
  return null;
}

/**
 * Normaliza cualquier mensaje de error (HTTP, AEAT o texto libre) para mostrarlo al usuario.
 */
export function formatUserFacingError(raw: string | null | undefined): string {
  if (!raw?.trim()) return "";
  const allowedNif = formatAllowedNifMessage(raw);
  if (allowedNif) return allowedNif;
  const humanized = humanizeAeatError(raw);
  if (humanized && humanized !== raw) return humanized;
  return raw.trim();
}

export function formatSimplefactuHttpError(
  status: number,
  body: Record<string, unknown>
): string {
  const msg = (body.message ?? body.error) as string | undefined;
  const validationDetails = formatValidationDetails(body);

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

  if (status === 403) {
    if (msg && typeof msg === "string") {
      const allowedNif = formatAllowedNifMessage(msg);
      if (allowedNif) return allowedNif;
      if (/certificate|certificado/i.test(msg)) {
        return "Falta el certificado digital o no tienes permiso para usarlo. Sube tu .pfx en Ajustes → Verifactu.";
      }
      if (/your own jobs/i.test(msg)) {
        return "No puedes consultar el estado de un envío que no pertenece a tu cuenta.";
      }
      return msg;
    }
    return "No tienes permiso para realizar esta operación. Revisa Ajustes → Verifactu.";
  }

  if (status === 400) {
    if (validationDetails) return validationDetails;
    if (msg && typeof msg === "string") return msg;
    return "Los datos enviados no son válidos. Revisa la factura y vuelve a intentarlo.";
  }

  if (status === 409) {
    const chainMsg = formatChainError(body);
    if (chainMsg) return chainMsg;
    if (msg && typeof msg === "string") return msg;
    return "Conflicto al registrar la factura. Puede que ya exista un envío con los mismos datos.";
  }

  if (status === 502) {
    if (msg && typeof msg === "string") {
      return `AEAT no respondió correctamente: ${msg}. Inténtalo de nuevo en unos minutos.`;
    }
    return "AEAT no respondió correctamente. Inténtalo de nuevo en unos minutos.";
  }

  if (status === 401) {
    return "Tu clave de acceso a Verifactu ya no es válida. Cierra sesión, vuelve a entrar y, si persiste, contacta soporte.";
  }

  if (msg && typeof msg === "string") return formatUserFacingError(msg);
  return `No se pudo completar la operación (error ${status}). Inténtalo de nuevo.`;
}
