import type { InvoiceRecordRow } from "@/lib/simplefactu/invoice-records";
import { fetchInvoiceRecords, type InvoiceRecordsQuery } from "@/lib/simplefactu/invoice-records";

const EXPORT_PAGE_SIZE = 200;
const EXPORT_MAX_ROWS = 5000;

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

export async function fetchInvoiceRecordsForExport(
  userId: string,
  query: Omit<InvoiceRecordsQuery, "limit" | "offset">
): Promise<InvoiceRecordRow[]> {
  const rows: InvoiceRecordRow[] = [];
  let offset = 0;

  while (rows.length < EXPORT_MAX_ROWS) {
    const page = await fetchInvoiceRecords(userId, {
      ...query,
      limit: EXPORT_PAGE_SIZE,
      offset,
    });
    rows.push(...page.rows);
    if (page.rows.length === 0 || rows.length >= page.total) {
      break;
    }
    offset += EXPORT_PAGE_SIZE;
  }

  return rows.slice(0, EXPORT_MAX_ROWS);
}

export function invoiceRecordsToCsv(rows: InvoiceRecordRow[]): string {
  const lines = [CSV_HEADER, ...rows.map(rowToCsvLine)];
  return `${lines.join("\n")}\n`;
}
