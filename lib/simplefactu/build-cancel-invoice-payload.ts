import type { Invoice, UserVerifactuAccount } from "@prisma/client";
import { toDdMmYyyy } from "./build-send-invoice-payload";

/**
 * Body for POST /cancel-invoice. Omits huella and sistemaInformatico so the API
 * generates them (platform SIF unless tenant clientSifEnabled).
 */
export function buildCancelInvoicePayload(
  invoice: Invoice,
  account: UserVerifactuAccount
): Record<string, unknown> {
  const issuerNif = (account.issuerNif || "").trim();
  const issuerName = (account.issuerLegalName || "").trim();
  if (!issuerNif || !issuerName) {
    throw new Error(
      "Configura el NIF y la razón social del emisor en Ajustes → Verifactu."
    );
  }

  return {
    nif: issuerNif,
    nombre: issuerName,
    facturaAnulada: {
      idEmisorFacturaAnulada: issuerNif,
      numSerieFacturaAnulada: invoice.number,
      fechaExpedicionFacturaAnulada: toDdMmYyyy(invoice.issueDate),
    },
    rechazoPrevio: "N",
  };
}
