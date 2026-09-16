import { formatVerifactuActionError } from "@/lib/simplefactu/api-errors";
import { getSimplefactuBaseUrl } from "@/lib/simplefactu/client";

/** API origin without the `/v1` suffix (`/ready` and `/health` live at root). */
export function getSimplefactuApiOrigin(): string {
  return getSimplefactuBaseUrl().replace(/\/v1\/?$/, "");
}

export type PublicReadyProbe = {
  ok: boolean;
  status: number;
  checks?: Record<string, unknown>;
  errors?: string[];
  /** Present when the probe never got an HTTP response (TLS, DNS, timeout). */
  networkError?: string;
};

export async function probeApiReady(): Promise<PublicReadyProbe> {
  const url = `${getSimplefactuApiOrigin()}/ready`;
  try {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    const body = (await res.json().catch(() => ({}))) as {
      ready?: boolean;
      checks?: Record<string, unknown>;
      errors?: string[];
    };
    const ok = res.ok && body.ready !== false;
    return { ok, status: res.status, checks: body.checks, errors: body.errors };
  } catch (e) {
    return { ok: false, status: 0, networkError: formatVerifactuActionError(e) };
  }
}
