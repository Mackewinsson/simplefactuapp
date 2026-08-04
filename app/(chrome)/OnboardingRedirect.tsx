import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getAdminImpersonatedTenant } from "@/lib/auth/admin-impersonate";
import { isPendingIntegrator } from "@/lib/auth/account-type";
import { getOnboardingStatus, isOnboardingExemptPath } from "@/lib/verifactu/onboarding-status";

/**
 * Redirects new users to /onboarding until issuer, certificate and first AEAT invoice are done.
 * Integrators pending production approval skip autónomo onboarding.
 */
export async function OnboardingRedirect() {
  const { userId } = await auth();
  if (!userId) return null;

  // Don't force onboarding while an admin is viewing another tenant.
  if (await getAdminImpersonatedTenant(userId)) return null;

  // Partner / integrator path does not use autónomo Veri*Factu onboarding.
  if (await isPendingIntegrator(userId)) return null;

  const h = await headers();
  const pathname = h.get("x-pathname") || "";
  if (!pathname || isOnboardingExemptPath(pathname)) return null;

  const status = await getOnboardingStatus(userId);
  if (!status.complete) {
    redirect("/onboarding");
  }

  return null;
}
