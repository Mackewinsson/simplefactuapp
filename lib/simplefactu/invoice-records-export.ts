import {
  fetchInvoiceRecords,
  type InvoiceRecordRow,
  type InvoiceRecordsQuery,
} from "@/lib/simplefactu/invoice-records";

const EXPORT_PAGE_SIZE = 200;
const EXPORT_MAX_ROWS = 5000;

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
