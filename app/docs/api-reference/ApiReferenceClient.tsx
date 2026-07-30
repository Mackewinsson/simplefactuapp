"use client";

import { useEffect, useRef } from "react";
import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";
import { DOCS_API_SEND_INVOICE_HASH } from "@/lib/docs/api-reference-links";
import { useLocalizeScalarUi } from "@/lib/docs/localize-scalar-ui";

export type ScalarServerEntry = { url: string; description?: string };

/**
 * Client wrapper for Scalar's React component. The component is hydrated
 * on the client because it uses code-mirror / its own theme runtime, which
 * doesn't render meaningfully on the server.
 *
 * `scalarServers` is passed from the server page so Scalar's "Try it" / server
 * selector uses the public API URL even when the proxied spec still mentions
 * localhost from upstream.
 *
 * Deep-link hashes (guides → this page) use:
 * `#tag/{Tag}/{METHOD}{path}` e.g. `#tag/Facturas/POST/send-invoice`
 * Keep `generateTagSlug` / `generateOperationSlug` in sync with
 * `lib/docs/api-reference-links.ts`.
 *
 * Visiting `/docs/api-reference` with no hash lands on POST /send-invoice so
 * the primary Test Request is one click away (Scalar has no “open client”
 * config flag).
 */
export function ApiReferenceClient({
  specUrl,
  scalarServers,
}: {
  specUrl: string;
  scalarServers: ScalarServerEntry[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  useLocalizeScalarUi(containerRef);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash) return;
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}${DOCS_API_SEND_INVOICE_HASH}`
    );
    // Nudge Scalar to pick up the hash after mount (hashchange is enough for most builds).
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }, []);

  return (
    <div ref={containerRef} className="min-w-0 [&_.scalar-app]:min-w-0">
      <ApiReferenceReact
        configuration={{
          url: specUrl,
          servers: scalarServers,
          // Prefer the versioned base for request examples / address bar
          baseServerURL: scalarServers[0]?.url,
          // Keep the visual lighter than Scalar's default purple to blend
          // with the rest of /docs (Fumadocs default theme).
          theme: "default",
          hideClientButton: false,
          defaultOpenFirstTag: true,
          // Stable hashes for guide deep-links (see api-reference-links.ts).
          generateTagSlug: (tag) => tag.name ?? "tag",
          generateOperationSlug: (operation) =>
            `${String(operation.method).toUpperCase()}${operation.path}`,
          // Default to Shell/curl, which generates correct code for all endpoints.
          defaultHttpClient: {
            targetKey: "shell",
            clientKey: "curl",
          },
          // Hide the PowerShell Invoke-WebRequest client: Scalar generates code
          // that sets Content-Type both in the $headers hashtable and via
          // -ContentType, which causes a runtime error in PowerShell.
          hiddenClients: {
            powershell: ["webrequest"],
          },
          // Pre-fill the auth widget with the right header name so users
          // don't have to guess.
          authentication: {
            preferredSecurityScheme: "ApiKeyAuth",
          },
        }}
      />
    </div>
  );
}
