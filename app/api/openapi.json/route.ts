import { NextResponse } from "next/server";
import { getSimplefactuBaseUrl } from "@/lib/simplefactu/client";
import { filterPublicOpenApi } from "@/lib/docs/filter-openapi";

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

export async function GET() {
  let baseUrl: string;
  try {
    baseUrl = getSimplefactuBaseUrl();
  } catch (err) {
    return NextResponse.json(
      {
        error: "config",
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }

  const upstream = `${baseUrl}/openapi.json`;

  let res: Response;
  try {
    res = await fetch(upstream, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "upstream_unreachable",
        upstream,
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 502 }
    );
  }

  if (!res.ok) {
    return NextResponse.json(
      {
        error: "upstream_error",
        upstream,
        status: res.status,
        statusText: res.statusText,
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

  const filtered = filterPublicOpenApi(parsed);

  return new NextResponse(JSON.stringify(filtered), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
