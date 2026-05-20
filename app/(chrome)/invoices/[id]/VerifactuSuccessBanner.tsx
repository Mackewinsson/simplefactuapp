import Link from "next/link";

type Props = {
  invoiceNumber: string;
  aeatCsv: string;
  aeatQrText: string | null;
  aeatQrDataUrl: string | null;
  pdfHref: string;
};

/**
 * Prominent success state after AEAT accepts the invoice (CSV + QR + PDF).
 */
export function VerifactuSuccessBanner({
  invoiceNumber,
  aeatCsv,
  aeatQrText,
  aeatQrDataUrl,
  pdfHref,
}: Props) {
  return (
    <div className="mb-4 rounded-lg border border-success-outline bg-success p-4 text-success-foreground">
      <p className="text-base font-semibold">Factura registrada en AEAT</p>
      <p className="mt-1 text-sm text-success-emphasis">
        La factura <span className="font-mono">{invoiceNumber}</span> está en Verifactu. Guarda el
        CSV y descarga el PDF con el QR de verificación.
      </p>
      <dl className="mt-4 grid gap-3 text-sm">
        <div>
          <dt className="font-medium">Código seguro de verificación (CSV)</dt>
          <dd className="mt-1">
            <code className="rounded bg-surface px-2 py-1 font-mono text-sm text-fg">{aeatCsv}</code>
          </dd>
        </div>
        {aeatQrText ? (
          <div>
            <dt className="font-medium">Comprobación en sede AEAT</dt>
            <dd className="mt-1">
              <a
                href={aeatQrText}
                target="_blank"
                rel="noreferrer"
                className="text-fg-link underline hover:text-fg"
              >
                Abrir validador AEAT ↗
              </a>
            </dd>
          </div>
        ) : null}
      </dl>
      {aeatQrDataUrl ? (
        <div className="mt-4 flex flex-wrap items-start gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={aeatQrDataUrl}
            alt="QR de verificación AEAT"
            className="h-28 w-28 rounded border border-success-outline bg-surface p-1"
            width={112}
            height={112}
          />
          <p className="max-w-xs text-xs text-success-emphasis">
            Incluye este QR en el PDF que entregues al cliente. La leyenda{" "}
            <span className="font-mono font-semibold">VERI*FACTU</span> identifica el registro ante
            Hacienda.
          </p>
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <a href={pdfHref} download className="btn btn-sm btn-cta">
          Descargar PDF
        </a>
        <Link href="/invoices" className="btn btn-sm btn-secondary">
          Volver a facturas
        </Link>
      </div>
    </div>
  );
}
