"use server";

import { headers } from "next/headers";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ensureVerifactuApiKey } from "@/lib/verifactu/provision";
import { formatVerifactuActionError } from "@/lib/simplefactu/api-errors";
import { isBillingEnabled } from "@/lib/billing/feature";
import { isLemonSqueezyConfigured } from "@/lib/lemonsqueezy/config";
import { createProCheckout } from "@/lib/lemonsqueezy/client";

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
 * Server action: creates a Lemon Squeezy checkout for Pro and returns the redirect URL.
 */
export async function startUpgradeAction(): Promise<StartUpgradeResult> {
  if (!isBillingEnabled()) {
    return { ok: false, message: "La facturación no está activa en este entorno." };
  }

  if (!isLemonSqueezyConfigured()) {
    return {
      ok: false,
      message: "Lemon Squeezy no está configurado. Contacta con soporte.",
    };
  }

  const { userId } = await auth();
  if (!userId) return { ok: false, message: "Sesión expirada" };

  try {
    const user = await currentUser();
    const { tenantId } = await ensureVerifactuApiKey(userId);
    const origin = await getAppOrigin();

    const checkoutUrl = await createProCheckout({
      tenantId,
      userId,
      email: user?.primaryEmailAddress?.emailAddress ?? null,
      name: user?.fullName ?? user?.firstName ?? null,
      successUrl: `${origin}/settings/billing/success`,
    });

    return { ok: true, checkoutUrl };
  } catch (e) {
    return { ok: false, message: formatVerifactuActionError(e) };
  }
}
