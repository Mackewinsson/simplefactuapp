import { getSimplefactuBaseUrl } from "@/lib/simplefactu/client";

export class SimplefactuAdminError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown
  ) {
    super(message);
    this.name = "SimplefactuAdminError";
  }
}

export function requireSimplefactuAdminKey(): string {
  const adminKey = process.env.SIMPLEFACTU_ADMIN_KEY?.trim();
  if (!adminKey) {
    throw new Error("SIMPLEFACTU_ADMIN_KEY no está definida");
  }
  return adminKey;
}

function adminFetchTimeoutMs(): number {
  const n = parseInt(process.env.SIMPLEFACTU_ADMIN_FETCH_TIMEOUT_MS ?? "30000", 10);
  return Number.isFinite(n) && n > 0 ? n : 30000;
}

/**
 * Server-only fetch to simplefactu admin routes (x-admin-key).
 * Uses AbortSignal.timeout unless `init.signal` is provided.
 */
export async function adminFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const adminKey = requireSimplefactuAdminKey();
  const base = getSimplefactuBaseUrl();
  const url = `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  const ms = adminFetchTimeoutMs();
  const signal = init.signal ?? AbortSignal.timeout(ms);
  return fetch(url, {
    ...init,
    signal,
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": adminKey,
      ...init.headers,
    },
  });
}

export async function adminJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await adminFetch(path, init);
  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text };
    }
  }
  if (!res.ok) {
    let msg =
      typeof body === "object" && body !== null && "message" in body
        ? String((body as { message?: string }).message)
        : res.statusText;
    if (res.status === 401) {
      msg = "simplefactu rechazó la admin key (401).";
    }
    throw new SimplefactuAdminError(msg || `HTTP ${res.status}`, res.status, body);
  }
  return body as T;
}

// --- Typed helpers ---

export type AdminDiagnostics = {
  success: boolean;
  version?: string;
  nodeVersion?: string;
  database?: { dialect?: string; connected?: boolean };
  worker?: { enabled?: boolean; asyncMode?: boolean; maxRetries?: number };
  jobs?: {
    byStatus?: Record<string, number>;
    pendingFailedLastHour?: number;
  };
  timestamp?: string;
};

export type AdminTenant = {
  id: string;
  name: string | null;
  plan_id: string;
  status: string;
  stripe_customer_id?: string | null;
  created_at?: string;
};

export type ListTenantsResponse = {
  success: boolean;
  tenants: AdminTenant[];
  pagination: { total: number; limit: number; offset: number };
};

export type CertificateMetaResponse = {
  success: boolean;
  tenantId: string;
  hasCertificate: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export async function getDiagnostics(): Promise<AdminDiagnostics> {
  return adminJson<AdminDiagnostics>("/admin/diagnostics", { method: "GET" });
}

export async function listTenants(limit: number, offset: number): Promise<ListTenantsResponse> {
  const q = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return adminJson<ListTenantsResponse>(`/admin/tenants?${q}`, { method: "GET" });
}

export async function getTenant(id: string): Promise<{ success: boolean; tenant: AdminTenant }> {
  return adminJson(`/admin/tenants/${encodeURIComponent(id)}`, { method: "GET" });
}

export async function patchTenant(
  id: string,
  body: { name?: string; planId?: string; status?: string }
): Promise<{ success: boolean; tenant: AdminTenant }> {
  return adminJson(`/admin/tenants/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function getTenantCertificateMeta(tenantId: string): Promise<CertificateMetaResponse> {
  return adminJson<CertificateMetaResponse>(
    `/admin/tenant/${encodeURIComponent(tenantId)}/certificate`,
    { method: "GET" }
  );
}

export async function postMaintenanceOn(tenantId: string): Promise<{ success: boolean; message?: string }> {
  return adminJson(`/admin/maintenance/${encodeURIComponent(tenantId)}/on`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function postMaintenanceOff(tenantId: string): Promise<{ success: boolean; message?: string }> {
  return adminJson(`/admin/maintenance/${encodeURIComponent(tenantId)}/off`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function postJobRetry(jobId: string): Promise<{ success: boolean; message?: string }> {
  return adminJson(`/admin/jobs/${encodeURIComponent(jobId)}/retry`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export type AdminJobRow = {
  id: string;
  tenant_id: string;
  type: string;
  status: string;
  attempts: number;
  max_attempts: number;
  run_at: string;
  last_error: string | null;
  idempotency_key: string | null;
  created_at: string;
  updated_at: string;
};

export type ListAdminJobsResponse = {
  success: boolean;
  jobs: AdminJobRow[];
  pagination: { total: number; limit: number; offset: number };
};

export async function listAdminJobs(params: {
  tenantId?: string;
  status?: string;
  limit: number;
  offset: number;
}): Promise<ListAdminJobsResponse> {
  const q = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  });
  if (params.tenantId) q.set("tenant_id", params.tenantId);
  if (params.status) q.set("status", params.status);
  return adminJson<ListAdminJobsResponse>(`/admin/jobs?${q}`, { method: "GET" });
}

export type AdminJobDetail = AdminJobRow & { payload_json?: string };

export type AdminJobDetailResponse = {
  success: boolean;
  job: AdminJobDetail;
  result: null | {
    httpStatus: number;
    responsePreview: unknown;
    truncated: boolean;
    createdAt: string;
  };
};

export async function getAdminJob(jobId: string): Promise<AdminJobDetailResponse> {
  return adminJson<AdminJobDetailResponse>(`/admin/jobs/${encodeURIComponent(jobId)}`, {
    method: "GET",
  });
}

export type RateLimitConfigResponse = {
  success: boolean;
  message?: string;
  rateLimitWindowSec?: number;
  rateLimitMaxRequests?: number;
};

export async function getRateLimitConfig(): Promise<RateLimitConfigResponse> {
  return adminJson<RateLimitConfigResponse>("/admin/rate-limit-config", { method: "GET" });
}

export type AdminMetricsResponse = {
  success: boolean;
  tenantId: string;
  from: string;
  to: string;
  metrics: unknown;
  totals: unknown;
};

export async function getAdminMetrics(
  tenantId: string,
  from: string,
  to: string
): Promise<AdminMetricsResponse> {
  const q = new URLSearchParams({ tenantId, from, to });
  return adminJson<AdminMetricsResponse>(`/admin/metrics?${q}`, { method: "GET" });
}

export type AdminApiKeyRow = {
  id: string;
  tenant_id: string;
  name: string | null;
  scopes: string[];
  status: string;
  revoked_at: string | null;
  last_used_at: string | null;
  created_at: string;
};

export async function listApiKeysForTenant(tenantId: string): Promise<{ success: boolean; keys: AdminApiKeyRow[] }> {
  const q = new URLSearchParams({ tenantId });
  return adminJson(`/admin/api-keys?${q}`, { method: "GET" });
}

export async function postCreateApiKey(params: {
  tenantId: string;
  name?: string;
  scopes: string[];
}): Promise<{
  success: boolean;
  apiKey: { id: string; key?: string; warning?: string; name: string | null; scopes: string[] };
}> {
  return adminJson("/admin/api-keys", {
    method: "POST",
    body: JSON.stringify({
      tenantId: params.tenantId,
      name: params.name ?? "admin-panel",
      scopes: params.scopes,
    }),
  });
}

export async function postRevokeApiKey(keyId: string): Promise<{ success: boolean; message?: string }> {
  return adminJson(`/admin/api-keys/${encodeURIComponent(keyId)}/revoke`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function postUploadTenantCertificate(params: {
  tenantId: string;
  pfxBase64: string;
  pfxPassphrase: string;
}): Promise<{ success: boolean; tenantId?: string; updated?: boolean }> {
  return adminJson("/admin/tenant/certificate", {
    method: "POST",
    body: JSON.stringify({
      tenantId: params.tenantId,
      pfxBase64: params.pfxBase64,
      pfxPassphrase: params.pfxPassphrase,
    }),
  });
}

export async function deleteTenantCertificate(tenantId: string): Promise<{
  success: boolean;
  tenantId?: string;
  deleted?: boolean;
}> {
  return adminJson(`/admin/tenant/${encodeURIComponent(tenantId)}/certificate`, {
    method: "DELETE",
  });
}

export type AdminChainRow = {
  id: string;
  tenantId: string;
  chainKey: string;
  lastHuella: string;
  lastTimestamp: string | null;
  updatedAt: string;
};

export async function getTenantChains(tenantId: string): Promise<{
  success: boolean;
  tenantId: string;
  chains: AdminChainRow[];
}> {
  return adminJson(`/admin/tenants/${encodeURIComponent(tenantId)}/chains`, { method: "GET" });
}
