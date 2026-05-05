import QRCode from "qrcode";

/**
 * Generate a base64 data URL containing a PNG QR code for the given text.
 * Server-only helper (depends on the `qrcode` Node API).
 *
 * Used by the invoice detail page to embed the AEAT verification QR alongside
 * the CSV. The QR is mandated by RD 1007/2023 art. 25 — every Veri*Factu
 * invoice must be verifiable from a printable code that points to sede AEAT.
 */
export async function verifactuQrDataUrl(qrText: string): Promise<string | null> {
  if (!qrText || typeof qrText !== "string") return null;
  try {
    return await QRCode.toDataURL(qrText, {
      // PNG with quiet zone large enough for reliable scanning. AEAT's spec
      // doesn't pin a fixed size; this matches the size used in the PDF.
      errorCorrectionLevel: "M",
      margin: 2,
      width: 220,
    });
  } catch {
    return null;
  }
}
