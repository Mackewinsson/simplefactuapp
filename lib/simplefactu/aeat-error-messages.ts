/**
 * User-friendly Spanish messages for AEAT Verifactu error codes.
 *
 * Priority:
 *  1. If the backend provides a structured description (via aeatErrors[]), that is
 *     persisted in aeatLastError as "[code] description". humanizeAeatError extracts
 *     the code and maps it to a friendly message when one is available.
 *  2. Codes not listed here fall back to the description stored by the backend
 *     (from the official AEAT catalogue), which is already in Spanish.
 *
 * Source: docs/verifactu/codigosdeerror.md
 */

/** User-friendly overrides for the most impactful codes (add more as needed). */
const AEAT_ERROR_FRIENDLY: Record<string, string> = {
  // ── Accepted with warnings (2xxx) ────────────────────────────────────────────
  "2000": "La firma digital (huella) de la factura no coincide con el cálculo de AEAT. Si persiste, contacta soporte.",
  "2001": "El NIF del destinatario no está identificado en el censo de la AEAT. Verifica el NIF del cliente.",
  "2004": "El campo FechaHoraHusoGenRegistro no coincide con el reloj de AEAT (margen superado). Revisa la hora del servidor.",
  "2007": "AEAT detectó que ya existen registros en esta serie. El sistema corregirá el encadenamiento en el siguiente envío.",
  "2008": "La huella del registro anterior no puede ser igual a la del registro actual.",

  // ── Record-level rejections (1xxx) ───────────────────────────────────────────
  "1104": "El número de serie de la factura (NumSerieFactura) no es válido o contiene caracteres no permitidos.",
  "1108": "El NIF del IDEmisorFactura debe ser el mismo que el NIF del ObligadoEmision (emisor).",
  "1109": "El NIF del destinatario no está identificado en el censo de la AEAT. Verifica el NIF del cliente.",
  "1110": "El NIF informado no está identificado en el censo de la AEAT.",
  "1123": "El formato del NIF es incorrecto.",
  "1130": "El campo NumSerieFactura contiene caracteres no permitidos.",
  "1152": "La fecha de expedición no puede ser anterior al 28 de octubre de 2024.",
  "1176": "El NIF del sistema informático (SistemaInformatico) no es válido. Contacta soporte.",
  "1177": "El identificador del sistema informático (IdSistemaInformatico) no es válido. Contacta soporte.",
  "1179": "Error en el bloque SistemaInformatico del envío. Contacta soporte.",
  "1180": "Error en el encadenamiento (Encadenamiento). La firma de la factura anterior puede ser incorrecta.",
  "1215": "Error en el bloque ObligadoEmision. Verifica el NIF y nombre del emisor.",
  "1239": "El NIF del destinatario no está identificado en el censo de la AEAT. Verifica el NIF del cliente.",
  "1244": "El campo FechaHoraHusoGenRegistro tiene un formato incorrecto. Revisa el reloj del servidor.",
  "1262": "La longitud de la huella no cumple las especificaciones (debe ser SHA-256 en hexadecimal).",
  "1269": "El bloque Registro Anterior no está informado correctamente. El encadenamiento puede estar roto.",
  "1274": "El valor del campo PrimerRegistro es incorrecto.",
  "1278": "La huella del registro anterior no puede ser igual a la del registro actual.",
  "1291": "El HASH del Registro anterior no es alfanumérico.",
  "1292": "El HASH de la factura no es alfanumérico.",

  // ── Record-level rejections (3xxx) ───────────────────────────────────────────
  "3000": "La factura ya fue registrada previamente en AEAT (registro duplicado).",
  "3001": "La factura ya ha sido dada de baja en AEAT. No se puede anular de nuevo.",
  "3002": "La factura no existe en el sistema de AEAT. Verifica el número de serie y fecha.",
  "3003": "No tienes permisos para modificar este registro de facturación en AEAT.",

  // ── Submission-level rejections (4xxx) ──────────────────────────────────────
  "4102": "El XML enviado no cumple el esquema de AEAT (falta un campo obligatorio). Contacta soporte.",
  "4103": "Error al parsear el XML enviado a AEAT. Contacta soporte.",
  "4104": "El NIF del emisor no está registrado en el censo de la AEAT. Verifica tu NIF en Ajustes.",
  "4107": "El NIF no está identificado en el censo de la AEAT.",
  "4108": "Error técnico al obtener el certificado digital en AEAT. Contacta soporte.",
  "4109": "El NIF del sistema informático tiene un formato incorrecto. Contacta soporte.",
  "4112": "El titular del certificado no tiene los permisos necesarios para operar en AEAT.",
  "4115": "El NIF del ObligadoEmision es incorrecto. Verifica tu NIF en Ajustes.",
  "4116": "El NIF del ObligadoEmision tiene un formato incorrecto. Verifica tu NIF en Ajustes.",
  "4119": "El XML contiene caracteres con codificación no UTF-8. Contacta soporte.",
  "4134": "Servicio AEAT no activo en este momento. Inténtalo más tarde.",
  "4139": "Este servicio no está habilitado en el entorno de producción de AEAT.",
  "4141": "Tu acceso a VERIFACTU ha sido suspendido temporalmente. Contacta a AEAT: verifactu@correo.aeat.es.",
};

/**
 * Returns a user-friendly Spanish message for an AEAT error code embedded in
 * the raw error string stored in the database.
 *
 * Handles two formats written by job-sync.ts:
 *   - New format: "[1239] Error en el bloque Destinatario."  ← backend aeatErrors[]
 *   - Legacy format: "AEAT returned status: Incorrecto [code 1239]"  ← plain lastError
 *
 * Falls back to the embedded description (new format) or the raw string (legacy).
 */
export function humanizeAeatError(raw: string | null | undefined): string {
  if (!raw) return "";

  // New format: "[CODE] description" written by buildErrorMessage in job-sync.ts
  const bracketMatch = raw.match(/^\[(\d{4})\]\s*(.+)/);
  if (bracketMatch) {
    const [, code, description] = bracketMatch;
    return AEAT_ERROR_FRIENDLY[code] ?? description ?? raw;
  }

  // Multiple codes in one string, e.g. "[1239] ... | [4102] ..."
  const multiMatch = raw.match(/\[(\d{4})\]/);
  if (multiMatch) {
    const friendly = AEAT_ERROR_FRIENDLY[multiMatch[1]];
    if (friendly) return friendly;
    // Strip bracket wrapper for cleaner display
    return raw.replace(/\[(\d{4})\]\s*/g, "").trim();
  }

  // Legacy format: bare four-digit code anywhere in the string
  const bareMatch = raw.match(/\b(\d{4})\b/);
  if (bareMatch) {
    const friendly = AEAT_ERROR_FRIENDLY[bareMatch[1]];
    if (friendly) return friendly;
  }

  return raw;
}
