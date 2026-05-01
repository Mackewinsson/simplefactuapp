const AEAT_ERROR_MAP: Record<string, string> = {
  "1239":
    "El NIF del destinatario no está reconocido por AEAT. Verifica el NIF del cliente.",
  "2000":
    "La firma digital (huella) de la factura no coincide con el cálculo de AEAT. Si el problema persiste, contacta soporte.",
  "2007":
    "AEAT detectó que ya existen facturas en esta serie. El sistema intentará corregir el encadenamiento en el siguiente envío.",
  "4102":
    "El XML enviado no cumple el esquema de AEAT (falta un campo obligatorio). Contacta soporte.",
  "4104":
    "El NIF del emisor no está registrado en AEAT. Verifica tu NIF en Ajustes.",
  "4109":
    "El NIF del sistema informático no es válido. Contacta soporte.",
  "4116":
    "El NIF del obligado a emitir no es válido. Verifica tu NIF en Ajustes.",
};

/**
 * Returns a human-readable Spanish message for a known AEAT error code embedded
 * in the raw error string. Falls back to the original raw string if no match found.
 */
export function humanizeAeatError(raw: string | null | undefined): string {
  if (!raw) return "";
  const match = raw.match(/\b(\d{4})\b/);
  if (match) {
    const friendly = AEAT_ERROR_MAP[match[1]];
    if (friendly) return friendly;
  }
  return raw;
}
