import type { Invoice, InvoiceItem, UserVerifactuAccount } from "@prisma/client";

export type SistemaInformaticoEnv = {
  nombreRazon: string;
  nif: string;
  nombreSistemaInformatico: string;
  idSistemaInformatico: string;
  version: string;
  tipoUsoPosibleSoloVerifactu: "S" | "N";
  tipoUsoPosibleMultiOT: "S" | "N";
  indicadorMultiplesOT: "S" | "N";
};

export function toDdMmYyyy(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export function readSiFromEnv(issuer: {
  issuerNif: string | null;
  issuerLegalName: string | null;
}): SistemaInformaticoEnv {
  const nombreRazon = (process.env.VERIFACTU_SI_NOMBRE_RAZON || issuer.issuerLegalName || "").trim();
  const nif = (process.env.VERIFACTU_SI_NIF || issuer.issuerNif || "").trim();
  const nombreSistemaInformatico = (process.env.VERIFACTU_SI_NOMBRE || "SimpleFactuApp").trim().slice(0, 30);
  const idSistemaInformatico = (process.env.VERIFACTU_SI_ID || "01").trim().slice(0, 2);
  const version = (process.env.VERIFACTU_SI_VERSION || "1.0.0").trim().slice(0, 50);
  const tipoUsoPosibleSoloVerifactu = (process.env.VERIFACTU_SI_SOLO_VERI || "S") as "S" | "N";
  const tipoUsoPosibleMultiOT = (process.env.VERIFACTU_SI_MULTI_OT || "N") as "S" | "N";
  const indicadorMultiplesOT = (process.env.VERIFACTU_SI_IND_MULTI_OT || "N") as "S" | "N";

  if (!nombreRazon) {
    throw new Error("Missing issuer legal name (UserVerifactuAccount or VERIFACTU_SI_NOMBRE_RAZON)");
  }
  if (!nif) {
    throw new Error("Missing issuer NIF (UserVerifactuAccount or VERIFACTU_SI_NIF)");
  }
  if (!/^[A-Z0-9]{2}$/.test(idSistemaInformatico)) {
    throw new Error("VERIFACTU_SI_ID must be exactly 2 characters [A-Z0-9]");
  }

  return {
    nombreRazon,
    nif,
    nombreSistemaInformatico,
    idSistemaInformatico,
    version,
    tipoUsoPosibleSoloVerifactu,
    tipoUsoPosibleMultiOT,
    indicadorMultiplesOT,
  };
}

/**
 * Build JSON body for POST /send-invoice. Omits huella / primerRegistro so the API infers and generates.
 */
export function buildSendInvoicePayload(
  invoice: Invoice & { items: InvoiceItem[] },
  account: UserVerifactuAccount
): Record<string, unknown> {
  const issuerNif = (account.issuerNif || "").trim();
  const issuerName = (account.issuerLegalName || "").trim();
  if (!issuerNif || !issuerName) {
    throw new Error("Configure issuer NIF and legal name in Verifactu settings before sending.");
  }

  const destNif = (invoice.customerNif || "").trim();
  if (!destNif) {
    throw new Error("Customer NIF/CIF is required for Verifactu.");
  }

  const si = readSiFromEnv({ issuerNif, issuerLegalName: issuerName });

  const subtotal = invoice.subtotalCents / 100;
  const cuota = invoice.taxCents / 100;
  const total = invoice.totalCents / 100;
  const tipo = invoice.taxRatePercent;

  const descripcion =
    (invoice.notes || "").trim() ||
    (invoice.items[0]?.description || "Operación sujeta").trim() ||
    "Operación sujeta";

  return {
    nif: issuerNif,
    nombre: issuerName,
    numSerie: invoice.number,
    fecha: toDdMmYyyy(invoice.issueDate),
    tipoFactura: "F1",
    descripcion,
    destNombre: invoice.customerName.trim(),
    destNif,
    cuotaTotal: cuota,
    total,
    detalles: [
      {
        clave: "01",
        calif: "S1",
        tipo,
        base: subtotal,
        cuota,
      },
    ],
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
  };
}
