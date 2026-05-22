/** AEAT Destinatario IDType (IDOtro) — aligned with API validation.js */
export const AEAT_DEST_ID_TYPES = [
  { value: "02", label: "02 – NIF-IVA intracomunitario" },
  { value: "03", label: "03 – Pasaporte" },
  { value: "04", label: "04 – Documento oficial país residencia" },
  { value: "05", label: "05 – Certificado de residencia" },
  { value: "06", label: "06 – Otro documento probatorio" },
] as const;

export type CustomerIdScheme = "NIF" | "ID_OTRO";

export type DestinatarioIdFields = {
  idScheme: CustomerIdScheme;
  idType: string;
  codigoPais: string;
  foreignId: string;
  nif: string;
};

export const EMPTY_DESTINATARIO_ID: DestinatarioIdFields = {
  idScheme: "NIF",
  idType: "",
  codigoPais: "",
  foreignId: "",
  nif: "",
};

export function destinatarioIdFromCustomer(c: {
  idScheme?: string | null;
  idType?: string | null;
  codigoPais?: string | null;
  foreignId?: string | null;
  nif?: string | null;
}): DestinatarioIdFields {
  const scheme = c.idScheme === "ID_OTRO" ? "ID_OTRO" : "NIF";
  return {
    idScheme: scheme,
    nif: c.nif ?? "",
    idType: c.idType ?? "",
    codigoPais: c.codigoPais ?? "",
    foreignId: c.foreignId ?? "",
  };
}

export function requiresCodigoPais(idType: string): boolean {
  return idType !== "" && idType !== "02";
}
