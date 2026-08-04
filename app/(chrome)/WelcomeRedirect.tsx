import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import {
  getUserAccountType,
  isPendingIntegrator,
  isSandboxAutoApproveIntegrators,
  shouldSkipWelcome,
} from "@/lib/auth/account-type";
import { getAdminImpersonatedTenant } from "@/lib/auth/admin-impersonate";

const WELCOME_EXEMPT_PREFIXES = [
  "/welcome",
  "/sign-in",
  "/sign-up",
  "/legal",
  "/admin",
  "/admin-access-denied",
  "/partner-access-denied",
  "/docs",
  "/api",
];

function isWelcomeExemptPath(pathname: string): boolean {
  if (!pathname) return true;
  return WELCOME_EXEMPT_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

/**
 * Forces new users without accountType to /welcome.
 * Pending integrators (prod) land on /partner/activation.
 */
export async function WelcomeRedirect() {
  const { userId } = await auth();
  if (!userId) return null;

  if (await getAdminImpersonatedTenant(userId)) return null;

  const h = await headers();
  const pathname = h.get("x-pathname") || "";
  if (isWelcomeExemptPath(pathname)) return null;

  if (await isPendingIntegrator(userId)) {
    if (!pathname.startsWith("/partner/activation")) {
      redirect("/partner/activation");
    }
    return null;
  }

  if (await shouldSkipWelcome(userId)) return null;

  const accountType = await getUserAccountType(userId);
  if (!accountType) {
    redirect("/welcome");
  }

  // Integrator with sandbox auto-approve should use /partner (role already set).
  if (accountType === "integrator" && isSandboxAutoApproveIntegrators()) {
    return null;
  }

  return null;
}
