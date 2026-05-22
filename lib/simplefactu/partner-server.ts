import "server-only";

import { getSimplefactuBaseUrl } from "@/lib/simplefactu/client";
import { ensurePartnerApiKey } from "@/lib/partner/provision";

function joinUrl(base: string, path: string): string {
  const b = base.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

export async function partnerFetch(
  userId: string,
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const { apiKey } = await ensurePartnerApiKey(userId);
  const baseUrl = getSimplefactuBaseUrl();
  const headers = new Headers(init.headers);
  if (
    !headers.has("Content-Type") &&
    init.body &&
    !(init.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("x-api-key", apiKey);

  return fetch(joinUrl(baseUrl, path), { ...init, headers });
}

export type PartnerSubtenant = {
  id: string;
  name: string | null;
  plan_id: string;
  status: string;
  allowed_nif: string | null;
  created_at: string;
  has_certificate?: number;
};

export async function listPartnerSubtenants(userId: string): Promise<PartnerSubtenant[]> {
  const res = await partnerFetch(userId, "/partner/tenants");
  const json = (await res.json().catch(() => ({}))) as {
    subtenants?: PartnerSubtenant[];
    message?: string;
  };
  if (!res.ok) {
    throw new Error(json.message || `Error ${res.status} al listar autónomos`);
  }
  return json.subtenants ?? [];
}

export async function getPartnerSubtenant(
  userId: string,
  childId: string
): Promise<PartnerSubtenant> {
  const res = await partnerFetch(userId, `/partner/tenants/${encodeURIComponent(childId)}`);
  const json = (await res.json().catch(() => ({}))) as {
    tenant?: PartnerSubtenant;
    message?: string;
  };
  if (!res.ok) {
    throw new Error(json.message || `Error ${res.status}`);
  }
  if (!json.tenant) throw new Error("Respuesta sin tenant");
  return json.tenant;
}

export async function listPartnerJobs(
  userId: string,
  childId: string,
  status?: string
): Promise<{ jobs: Array<Record<string, unknown>>; total: number }> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  const res = await partnerFetch(userId, `/partner/tenants/${encodeURIComponent(childId)}/jobs${qs}`);
  const json = (await res.json().catch(() => ({}))) as {
    jobs?: Array<Record<string, unknown>>;
    total?: number;
    message?: string;
  };
  if (!res.ok) {
    throw new Error(json.message || `Error ${res.status} al listar jobs`);
  }
  return { jobs: json.jobs ?? [], total: json.total ?? 0 };
}
