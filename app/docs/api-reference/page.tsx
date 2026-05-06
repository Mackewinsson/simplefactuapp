import { ApiReferenceClient } from "./ApiReferenceClient";

/**
 * Auto-generated API reference. Renders the simplefactu OpenAPI spec
 * (already exposed at https://api.tudominio.com/v1/openapi.json) with
 * Scalar's UI: searchable, with code samples in multiple languages,
 * "try it" panels, etc.
 *
 * The spec URL comes from NEXT_PUBLIC_SIMPLEFACTU_BASE_URL — same env
 * the app uses to talk to the API. Stays in sync automatically as we
 * ship new endpoints; no manual doc maintenance.
 */
export const metadata = { title: "API Reference — SimpleFactu Docs" };

export default function ApiReferencePage() {
  // Public env var (NEXT_PUBLIC_*) so it's available client-side. Falls
  // back to a local /v1/openapi.json so the page also works on dev when
  // both apps run on the same origin.
  const apiBase =
    process.env.NEXT_PUBLIC_SIMPLEFACTU_API_BASE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000/v1";
  const specUrl = `${apiBase}/openapi.json`;

  return <ApiReferenceClient specUrl={specUrl} />;
}
