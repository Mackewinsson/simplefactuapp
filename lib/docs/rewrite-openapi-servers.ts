/**
 * OpenAPI `servers` from the upstream API embed API_BASE_URL at build/load time,
 * often defaulting to localhost. When we proxy via Next, derive public URLs from
 * SIMPLEFACTU_API_BASE_URL so Scalar shows the correct try-it URLs in QA/prod.
 */
export function rewriteOpenApiServers(spec: unknown, simplefactuApiBaseUrl: string): unknown {
  if (!spec || typeof spec !== "object") return spec;
  const trimmed = simplefactuApiBaseUrl.replace(/\/$/, "").trim();
  if (!trimmed) return spec;

  const normalized = trimmed.toLowerCase().endsWith("/v1") ? trimmed : `${trimmed}/v1`;
  const rootOrigin = normalized.replace(/\/v1$/i, "");

  let hostLabel = "API";
  try {
    hostLabel = new URL(normalized).host;
  } catch {
    /* leave default */
  }

  const out = { ...(spec as Record<string, unknown>) };
  out.servers = [
    {
      url: normalized,
      description: `Base versionada (/v1) — ${hostLabel} (recomendada)`,
    },
    {
      url: rootOrigin,
      description: `Raíz — ${hostLabel} (compatibilidad hacia atrás)`,
    },
  ];

  return out;
}
