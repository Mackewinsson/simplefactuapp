"use client";

import { useState } from "react";

export function QRValidatorClient() {
  const [inputUrl, setInputUrl] = useState("");
  const [result, setResult] = useState<{
    valid: boolean;
    nif?: string;
    numSerie?: string;
    fecha?: string;
    importe?: string;
    huella?: string;
    rawUrl?: string;
    aeatLink?: string;
    error?: string;
  } | null>(null);

  const handleValidate = () => {
    if (!inputUrl.trim()) {
      setResult({ valid: false, error: "Por favor, introduce una URL o texto de código QR." });
      return;
    }

    try {
      let urlStr = inputUrl.trim();
      if (!urlStr.startsWith("http://") && !urlStr.startsWith("https://")) {
        urlStr = "https://" + urlStr;
      }

      const parsed = new URL(urlStr);
      const params = parsed.searchParams;

      const nif = params.get("nif") || params.get("NIF") || undefined;
      const numSerie = params.get("num") || params.get("numserie") || params.get("NUM") || undefined;
      const fecha = params.get("fecha") || params.get("FECHA") || undefined;
      const importe = params.get("importe") || params.get("IMPORTE") || undefined;
      const huella = params.get("huella") || params.get("HUELLA") || undefined;

      const isAEATDomain = parsed.hostname.includes("agenciatributaria") || parsed.hostname.includes("aeat");

      if (!nif && !numSerie && !huella) {
        setResult({
          valid: false,
          error: "No se han encontrado los parámetros estándar de Veri*Factu (nif, num, fecha, importe, huella).",
        });
        return;
      }

      setResult({
        valid: true,
        nif,
        numSerie,
        fecha,
        importe: importe ? `${importe} €` : undefined,
        huella,
        rawUrl: urlStr,
        aeatLink: isAEATDomain ? urlStr : undefined,
      });
    } catch {
      setResult({
        valid: false,
        error: "El texto introducido no tiene un formato de URL válido.",
      });
    }
  };

  const handleSample = () => {
    const sample = "https://www1.agenciatributaria.gob.es/wlpl/invi-valida/validaQR?nif=B12345678&num=A2026-0089&fecha=15-05-2026&importe=1210.00&huella=E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855";
    setInputUrl(sample);
  };

  return (
    <div className="rounded-2xl border border-outline-soft bg-surface p-6 shadow-sm sm:p-8">
      <label htmlFor="qr-input" className="block text-sm font-medium text-fg mb-2">
        Pega el contenido o la URL del Código QR Veri*Factu:
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          id="qr-input"
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="https://www1.agenciatributaria.gob.es/wlpl/invi-valida/validaQR?nif=..."
          className="flex-1 rounded-lg border border-outline-soft bg-surface-muted px-4 py-2.5 text-sm text-fg placeholder:text-fg-subtle focus:border-brand focus:outline-none"
        />
        <button
          onClick={handleValidate}
          className="btn btn-primary text-sm whitespace-nowrap px-6"
        >
          Validar QR
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <button
          onClick={handleSample}
          className="text-xs text-brand hover:underline"
        >
          Probemos con un ejemplo oficial de la AEAT
        </button>
      </div>

      {result && (
        <div className="mt-6 rounded-xl border border-outline-soft bg-surface-muted p-5">
          {result.valid ? (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">
                  Código QR Veri*Factu Decodificado Correctamente
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="rounded-lg border border-outline-soft bg-surface p-3">
                  <span className="text-xs text-fg-subtle block">NIF Emisor:</span>
                  <strong className="text-fg font-mono">{result.nif || "No especificado"}</strong>
                </div>

                <div className="rounded-lg border border-outline-soft bg-surface p-3">
                  <span className="text-xs text-fg-subtle block">Número de Factura / Serie:</span>
                  <strong className="text-fg font-mono">{result.numSerie || "No especificado"}</strong>
                </div>

                <div className="rounded-lg border border-outline-soft bg-surface p-3">
                  <span className="text-xs text-fg-subtle block">Fecha de Expedición:</span>
                  <strong className="text-fg">{result.fecha || "No especificada"}</strong>
                </div>

                <div className="rounded-lg border border-outline-soft bg-surface p-3">
                  <span className="text-xs text-fg-subtle block">Importe Total:</span>
                  <strong className="text-fg">{result.importe || "No especificado"}</strong>
                </div>
              </div>

              {result.huella && (
                <div className="mt-4 rounded-lg border border-outline-soft bg-surface p-3 text-sm">
                  <span className="text-xs text-fg-subtle block">Huella SHA-256 (Hash Encadenado):</span>
                  <code className="text-xs font-mono text-brand break-all block mt-1">
                    {result.huella}
                  </code>
                </div>
              )}

              {result.aeatLink && (
                <div className="mt-4">
                  <a
                    href={result.aeatLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline text-xs inline-flex items-center gap-1.5"
                  >
                    Verificar directamente en la Sede Electrónica AEAT ↗
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-rose-500 text-sm">
              <span>⚠️</span>
              <span>{result.error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
