"use server";

import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { ensureVerifactuApiKey } from "@/lib/verifactu/provision";
import { createSimplefactuClient, getSimplefactuBaseUrl } from "@/lib/simplefactu/client";

/**
 * Build absolute URLs for Stripe Checkout success/cancel callbacks. Stripe
 * needs absolute URLs; the app may run behind several reverse proxies, so we
 * derive the base from the request headers (x-forwarded-* aware) instead of
 * relying on a fixed env var.
 */
async function getAppOrigin(): Promise<string> {
  const h = await headers();
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const proto = h.get("x-forwarded-proto") || "https";
  const host = h.get("x-forwarded-host") || h.get("host");
  if (!host) {
    throw new Error("Cannot determine app origin: no host header and no NEXT_PUBLIC_APP_URL");
  }
  return `${proto}://${host}`;
}

export type StartUpgradeResult =
  | { ok: true; checkoutUrl: string }
  | { ok: false; message: string };

/**
 * Server action: opens a Stripe Checkout session for the upgrade and returns
 * the redirect URL. The caller is responsible for `window.location.href = url`
 * (or `redirect()` from Server Actions). Errors are returned as a tagged
 * union so the client can render a friendly message instead of a hard crash.
 */
export async function startUpgradeAction(
  planId: "pro" | "enterprise"
): Promise<StartUpgradeResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, message: "Sesión expirada" };

  try {
    const { apiKey } = await ensureVerifactuApiKey(userId);
    const client = createSimplefactuClient({
      baseUrl: getSimplefactuBaseUrl(),
      apiKey,
    });

    const origin = await getAppOrigin();
    const res = await client.postMeUpgrade({
      planId,
      successUrl: `${origin}/settings/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/settings/billing/cancel`,
    });

    if (!res.ok) {
      const body = (await client.parseJson(res)) as { message?: string } | null;
      return {
        ok: false,
        message: body?.message || `El pago no pudo iniciarse (HTTP ${res.status})`,
      };
    }

    const body = (await client.parseJson(res)) as { checkoutUrl?: string } | null;
    if (!body?.checkoutUrl) {
      return { ok: false, message: "Stripe no devolvió URL de checkout" };
    }
    return { ok: true, checkoutUrl: body.checkoutUrl };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    return { ok: false, message: msg };
  }
}
