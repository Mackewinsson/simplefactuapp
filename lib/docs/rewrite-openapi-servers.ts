/**
 * OpenAPI `servers` from the upstream API embed API_BASE_URL at build/load time,
 * often defaulting to localhost. When we proxy via Next, derive public URLs from
 * SIMPLEFACTU_API_BASE_URL (or NEXT_PUBLIC_* fallback via getSimplefactuBaseUrlForDocs)
 * so Scalar shows the correct try-it URLs in QA/prod.
 */
export type OpenApiServerEntry = { url: string; description: string };

export function buildOpenApiServerList(simplefactuApiBaseUrl: string): OpenApiServerEntry[] {
  const trimmed = simplefactuApiBaseUrl.replace(/\/$/, "").trim();
  if (!trimmed) return [];

  const normalized = trimmed.toLowerCase().endsWith("/v1") ? trimmed : `${trimmed}/v1`;
  const rootOrigin = normalized.replace(/\/v1$/i, "");

  let hostLabel = "API";
  try {
    hostLabel = new URL(normalized).host;
  } catch {
    /* leave default */
  }

  return [
    {
      url: normalized,
      description: `Base versionada (/v1) — ${hostLabel} (recomendada)`,
    },
    {
      url: rootOrigin,
      description: `Raíz — ${hostLabel} (compatibilidad hacia atrás)`,
    },
  ];
}

export function rewriteOpenApiServers(spec: unknown, simplefactuApiBaseUrl: string): unknown {
  if (!spec || typeof spec !== "object") return spec;
  const servers = buildOpenApiServerList(simplefactuApiBaseUrl);
  if (servers.length === 0) return spec;

  const out = { ...(spec as Record<string, unknown>) };
  out.servers = servers;

  return out;
}
