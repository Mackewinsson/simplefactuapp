/**
 * Payload string for the Verifactu verification QR (URL AEAT).
 * Prefers stored qrText; if only CSV exists, builds the standard ValidarQR URL.
 */
export function verifactuQrPayload(invoice: {
  aeatQrText: string | null;
  aeatCsv: string | null;
}): string | null {
  const url = invoice.aeatQrText?.trim();
  if (url) return url;
  const csv = invoice.aeatCsv?.trim();
  if (!csv) return null;
  const defaultBase = "https://prewww1.aeat.es/wlpl/TIKE-CONT/ValidarQR";
  const raw = process.env.VERIFACTU_VERIFY_QR_BASE?.trim();
  const base = (raw || defaultBase).split("?")[0].replace(/\/$/, "") || defaultBase;
  return `${base}?csv=${encodeURIComponent(csv)}`;
}
