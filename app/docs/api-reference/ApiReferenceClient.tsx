"use client";

import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";

/**
 * Client wrapper for Scalar's React component. The component is hydrated
 * on the client because it uses code-mirror / its own theme runtime, which
 * doesn't render meaningfully on the server.
 */
export function ApiReferenceClient({ specUrl }: { specUrl: string }) {
  return (
    <div className="-mx-4 md:-mx-8">
      <ApiReferenceReact
        configuration={{
          url: specUrl,
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
