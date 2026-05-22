/** Extract AEAT envío-level status from parsed SOAP JSON (xml2js shape). */
export function getEstadoEnvioFromAeatParsed(parsed: unknown): string | undefined {
  if (!parsed || typeof parsed !== "object") return undefined;
  const p = parsed as Record<string, unknown>;
  const envelope = p.Envelope ?? p.ENVELOPE ?? p.envelope;
  if (!envelope || typeof envelope !== "object") return undefined;
  const env = envelope as Record<string, unknown>;
  const body = env.Body ?? env.BODY ?? env.body;
  const b = Array.isArray(body)
    ? (body.find((x) => x && typeof x === "object") as Record<string, unknown> | undefined) ??
      (body[0] as Record<string, unknown> | undefined)
    : (body as Record<string, unknown> | undefined);
  if (!b) return undefined;

  const sal =
    b.RegFactuSistemaFacturacionSal ??
    b.RESPUESTAREGFACTUSISTEMAFACTURACION ??
    b.respuestaRegFactuSistemaFacturacion;
  if (!sal || typeof sal !== "object") return undefined;
  const s = sal as Record<string, unknown>;
  const raw = s.Estado ?? s.ESTADO ?? s.EstadoEnvio ?? s.ESTADOENVIO ?? s.estado;
  if (raw == null) return undefined;
  return typeof raw === "string" ? raw.trim() : String(raw);
}
