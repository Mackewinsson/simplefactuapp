/**
 * Payload string for the Verifactu verification QR (URL AEAT).
 * Always computes from invoice data so old invoices with stale aeatQrText are
 * retroactively fixed. URL format per AEAT spec:
 *   ValidarQR?nif={NIF}&numserie={numSerie}&fecha={DD-MM-AAAA}&importe={total}
 *
 * Returns null when the invoice has not been submitted to AEAT yet or when the
 * issuer NIF is not available.
 */
export function verifactuQrPayload(invoice: {
  issuerNif?: string | null;
  number: string;
  issueDate: Date;
  totalCents: number;
  aeatCsv?: string | null;
  aeatQrText?: string | null;
}): string | null {
  const hasSubmission = !!(invoice.aeatCsv?.trim() || invoice.aeatQrText?.trim());
  const nif = invoice.issuerNif?.trim();
  if (!hasSubmission || !nif) return null;

  const raw = process.env.VERIFACTU_VERIFY_QR_BASE?.trim();
  const base = (raw || "https://prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQR")
    .split("?")[0]
    .replace(/\/$/, "");

  const d = invoice.issueDate;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const fecha = `${dd}-${mm}-${yyyy}`;

  const params = new URLSearchParams({
    nif,
    numserie: invoice.number,
    fecha,
    importe: (invoice.totalCents / 100).toFixed(2),
  });
  return `${base}?${params.toString()}`;
}
