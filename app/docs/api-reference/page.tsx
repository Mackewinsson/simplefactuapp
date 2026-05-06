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
 */
export const metadata = { title: "API Reference — SimpleFactu Docs" };

export default function ApiReferencePage() {
  return <ApiReferenceClient specUrl="/api/openapi.json" />;
}
