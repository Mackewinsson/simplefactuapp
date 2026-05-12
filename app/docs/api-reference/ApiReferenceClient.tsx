"use client";

import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";

export type ScalarServerEntry = { url: string; description?: string };

/**
 * Client wrapper for Scalar's React component. The component is hydrated
 * on the client because it uses code-mirror / its own theme runtime, which
 * doesn't render meaningfully on the server.
 *
 * `scalarServers` is passed from the server page so Scalar's "Try it" / server
 * selector uses the public API URL even when the proxied spec still mentions
 * localhost from upstream.
 */
export function ApiReferenceClient({
  specUrl,
  scalarServers,
}: {
  specUrl: string;
  scalarServers: ScalarServerEntry[];
}) {
  return (
    <div className="-mx-4 md:-mx-8">
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
