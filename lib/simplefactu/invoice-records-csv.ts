import type { InvoiceRecordRow } from "@/lib/simplefactu/invoice-records";

function csvCell(value: string | null | undefined): string {
  const s = value ?? "";
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function rowToCsvLine(r: InvoiceRecordRow): string {
  return [
    r.numSerie,
    r.fecha,
    r.tipo,
    r.estado,
    r.csv,
    r.nifEmisor,
    r.serie,
    r.huella,
    r.huellaAnterior,
    r.numeroInstalacion,
    r.fechaHoraHusoGenRegistro,
    r.createdAt,
  ]
    .map((v) => csvCell(v == null ? "" : String(v)))
    .join(",");
}

const CSV_HEADER =
  "numSerie,fecha,tipo,estado,csv,nifEmisor,serie,huella,huellaAnterior,numeroInstalacion,fechaHoraHusoGenRegistro,createdAt";

/** Pure CSV formatter — safe to import from Node/tsx tests (no server-only deps). */
export function invoiceRecordsToCsv(rows: InvoiceRecordRow[]): string {
  const lines = [CSV_HEADER, ...rows.map(rowToCsvLine)];
  return `${lines.join("\n")}\n`;
}
