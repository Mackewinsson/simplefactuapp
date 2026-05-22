import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getOnboardingStatus, isOnboardingExemptPath } from "@/lib/verifactu/onboarding-status";

/**
 * Redirects new users to /onboarding until issuer, certificate and first AEAT invoice are done.
 */
export async function OnboardingRedirect() {
  const { userId } = await auth();
  if (!userId) return null;

  const h = await headers();
  const pathname = h.get("x-pathname") || "";
  if (!pathname || isOnboardingExemptPath(pathname)) return null;

  const status = await getOnboardingStatus(userId);
  if (!status.complete) {
    redirect("/onboarding");
  }

  return null;
}
