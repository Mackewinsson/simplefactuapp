import { NextResponse } from "next/server";
import { getSimplefactuDocsApiBaseUrl } from "@/lib/simplefactu/client";
import { filterPublicOpenApi } from "@/lib/docs/filter-openapi";
import { rewriteOpenApiServers } from "@/lib/docs/rewrite-openapi-servers";

/**
 * Server-side proxy that forwards the OpenAPI document published by the
 * simplefactu API. Used by /docs/api-reference (Scalar) so the spec is
 * served from this app's own origin — no CORS, no NEXT_PUBLIC_* env,
 * no exposing the API base URL to the browser.
 *
 * Cached for an hour because the OpenAPI spec changes only on API
 * deploys, and serving stale-while-revalidate is cheap.
 */
export const revalidate = 3600;

function buildOpenApiUpstreamCandidates(baseUrl: string): string[] {
  const normalized = baseUrl.replace(/\/$/, "");
  const root = normalized.replace(/\/v1$/i, "");
  const candidates = [`${normalized}/openapi.json`];
  if (root !== normalized) {
    candidates.push(`${root}/openapi.json`);
  }
  return candidates;
}

export async function GET() {
  let baseUrl: string;
  try {
    baseUrl = getSimplefactuDocsApiBaseUrl();
  } catch (err) {
    return NextResponse.json(
      {
        error: "config",
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }

  const upstreamCandidates = buildOpenApiUpstreamCandidates(baseUrl);

  let res: Response | null = null;
  let upstream = upstreamCandidates[0] ?? `${baseUrl}/openapi.json`;
  let lastError: unknown;

  for (const candidate of upstreamCandidates) {
    upstream = candidate;
    try {
      const attempt = await fetch(candidate, {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 },
      });
      if (attempt.ok) {
        res = attempt;
        break;
      }
      if (attempt.status === 404) {
        continue;
      }
      return NextResponse.json(
        {
          error: "upstream_error",
          upstream: candidate,
          status: attempt.status,
          statusText: attempt.statusText,
        },
        { status: 502 }
      );
    } catch (err) {
      lastError = err;
    }
  }

  if (!res) {
    return NextResponse.json(
      {
        error: "upstream_unreachable",
        upstream: upstreamCandidates.join(", "),
        message:
          lastError instanceof Error ? lastError.message : "OpenAPI spec not found",
      },
      { status: 502 }
    );
  }

  let parsed: unknown;
  try {
    parsed = await res.json();
  } catch (err) {
    return NextResponse.json(
      {
        error: "upstream_invalid_json",
        upstream,
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 502 }
    );
  }

  const withServers = rewriteOpenApiServers(parsed, baseUrl);
  const filtered = filterPublicOpenApi(withServers);

  return new NextResponse(JSON.stringify(filtered), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
