import type { Invoice, UserVerifactuAccount } from "@prisma/client";
import { readSiFromEnv, toDdMmYyyy } from "./build-send-invoice-payload";

/**
 * Body for POST /cancel-invoice. Omits huella fields so the API generates them.
 */
export function buildCancelInvoicePayload(
  invoice: Invoice,
  account: UserVerifactuAccount
): Record<string, unknown> {
  const issuerNif = (account.issuerNif || "").trim();
  const issuerName = (account.issuerLegalName || "").trim();
  if (!issuerNif || !issuerName) {
    throw new Error("Configure issuer NIF and legal name in Verifactu settings.");
  }

  const si = readSiFromEnv({ issuerNif, issuerLegalName: issuerName });

  return {
    nif: issuerNif,
    nombre: issuerName,
    facturaAnulada: {
      idEmisorFacturaAnulada: issuerNif,
      numSerieFacturaAnulada: invoice.number,
      fechaExpedicionFacturaAnulada: toDdMmYyyy(invoice.issueDate),
    },
    sistemaInformatico: {
      nombreRazon: si.nombreRazon,
      nif: si.nif,
      nombreSistemaInformatico: si.nombreSistemaInformatico,
      idSistemaInformatico: si.idSistemaInformatico,
      version: si.version,
      tipoUsoPosibleSoloVerifactu: si.tipoUsoPosibleSoloVerifactu,
      tipoUsoPosibleMultiOT: si.tipoUsoPosibleMultiOT,
      indicadorMultiplesOT: si.indicadorMultiplesOT,
    },
    rechazoPrevio: "N",
  };
}
