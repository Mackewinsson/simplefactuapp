/** Human-readable copy for the AEAT ledger UI (autónomo-facing). */

export function invoiceRecordTipoLabel(tipo: "ALTA" | "ANULACION"): string {
  return tipo === "ANULACION" ? "Anulación" : "Factura";
}

export function invoiceRecordEstadoLabel(estado: string): string {
  if (estado === "Correcto") return "Aceptada";
  if (estado === "ParcialmenteCorrecto") return "Aceptada con avisos";
  return estado;
}

export function invoiceRecordTipoBadgeVariant(
  tipo: "ALTA" | "ANULACION"
): "success" | "warning" {
  return tipo === "ANULACION" ? "warning" : "success";
}

export function invoiceRecordEstadoBadgeVariant(estado: string): "success" | "warning" {
  return estado === "Correcto" ? "success" : "warning";
}
