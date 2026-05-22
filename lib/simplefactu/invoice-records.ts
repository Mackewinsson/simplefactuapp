import { createSimplefactuClient, getSimplefactuBaseUrl } from "@/lib/simplefactu/client";
import { ensureVerifactuApiKey } from "@/lib/verifactu/provision";

export type InvoiceRecordRow = {
  id: string;
  tenantId: string;
  nifEmisor: string;
  serie: string;
  numSerie: string;
  fecha: string;
  fechaHoraHusoGenRegistro: string | null;
  tipo: "ALTA" | "ANULACION";
  huella: string;
  huellaAnterior: string | null;
  csv: string | null;
  numeroInstalacion: string | null;
  estado: string;
  createdAt: string;
};

export type InvoiceRecordsListResponse = {
  success: boolean;
  rows: InvoiceRecordRow[];
  total: number;
  limit: number;
  offset: number;
};

export type InvoiceRecordDetail = InvoiceRecordRow & {
  payload: Record<string, unknown> | null;
  aeatResponse: Record<string, unknown> | null;
};

export type InvoiceRecordDetailResponse = {
  success: boolean;
  record: InvoiceRecordDetail;
};

export type InvoiceRecordsQuery = {
  from?: string;
  to?: string;
  serie?: string;
  tipo?: "ALTA" | "ANULACION";
  limit?: number;
  offset?: number;
};

function toIsoRange(dateYmd: string, endOfDay: boolean): string {
  const d = dateYmd.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  return endOfDay ? `${d}T23:59:59.999Z` : `${d}T00:00:00.000Z`;
}

export async function fetchInvoiceRecords(
  userId: string,
  query: InvoiceRecordsQuery
): Promise<InvoiceRecordsListResponse> {
  const { apiKey } = await ensureVerifactuApiKey(userId);
  const client = createSimplefactuClient({
    baseUrl: getSimplefactuBaseUrl(),
    apiKey,
  });

  const q = new URLSearchParams();
  if (query.from) q.set("from", toIsoRange(query.from, false));
  if (query.to) q.set("to", toIsoRange(query.to, true));
  if (query.serie) q.set("serie", query.serie);
  if (query.tipo) q.set("tipo", query.tipo);
  q.set("limit", String(query.limit ?? 50));
  q.set("offset", String(query.offset ?? 0));

  const res = await client.getMeInvoiceRecords(q);
  const json = (await res.json().catch(() => ({}))) as InvoiceRecordsListResponse & {
    message?: string;
    error?: string;
  };

  if (!res.ok) {
    throw new Error(json.message || json.error || `Error ${res.status} al cargar registros AEAT`);
  }

  return json;
}

export async function fetchInvoiceRecordById(
  userId: string,
  id: string
): Promise<InvoiceRecordDetail> {
  const { apiKey } = await ensureVerifactuApiKey(userId);
  const client = createSimplefactuClient({
    baseUrl: getSimplefactuBaseUrl(),
    apiKey,
  });

  const res = await client.getMeInvoiceRecord(id);
  const json = (await res.json().catch(() => ({}))) as InvoiceRecordDetailResponse & {
    message?: string;
    error?: string;
  };

  if (!res.ok) {
    throw new Error(json.message || json.error || `Error ${res.status} al cargar el registro`);
  }

  return json.record;
}
