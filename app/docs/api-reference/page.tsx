import { docsBrowserPageTitle } from "@/lib/branding";
import { getSimplefactuDocsApiBaseUrl } from "@/lib/simplefactu/client";
import { buildOpenApiServerList } from "@/lib/docs/rewrite-openapi-servers";
import { ApiReferenceClient } from "./ApiReferenceClient";

/**
 * Auto-generated API reference. Renders the simplefactu OpenAPI spec with
 * Scalar's UI: searchable, with code samples in multiple languages,
 * "try it" panels, etc.
 *
 * The spec is served by this app at /api/openapi.json, which proxies the
 * upstream simplefactu API (using SIMPLEFACTU_API_BASE_URL from the
 * server env). Keeping the proxy means:
 *   - the browser hits the same origin → no CORS to configure on the API,
 *   - the API base URL stays server-side (no NEXT_PUBLIC_* leak),
 *   - the spec is cached at the edge for an hour.
 *
 * Scalar also receives explicit `servers` + `baseServerURL` from the same
 * base URL resolution so the Try-it bar never sticks to localhost from the
 * upstream spec.
 */

export const metadata = { title: docsBrowserPageTitle("Referencia API") };

export default function ApiReferencePage() {
  const scalarServers = buildOpenApiServerList(getSimplefactuDocsApiBaseUrl());
  return <ApiReferenceClient specUrl="/api/openapi.json" scalarServers={scalarServers} />;
}
