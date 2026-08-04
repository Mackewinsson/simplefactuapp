import "server-only";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { isUserAdmin } from "@/lib/auth/admin";
import { isUserPartner } from "@/lib/auth/partner";
import {
  isAccountType,
  type AccountType,
} from "@/lib/auth/account-type-shared";

export type { AccountType };
export { isAccountType, ACCOUNT_TYPES } from "@/lib/auth/account-type-shared";

export function isSandboxAutoApproveIntegrators(): boolean {
  return process.env.SANDBOX_AUTO_APPROVE_INTEGRATORS === "true";
}

export function getSandboxUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SANDBOX_URL?.trim();
  return raw && raw.length > 0 ? raw.replace(/\/$/, "") : "https://qa.simplefactu.com";
}

function accountTypeFromMetadata(metadata: Record<string, unknown> | undefined): AccountType | null {
  const value = metadata?.accountType;
  return isAccountType(value) ? value : null;
}

/**
 * Read accountType from session claims (fast) or Clerk API (authoritative).
 */
export async function getUserAccountType(userId: string): Promise<AccountType | null> {
  const { sessionClaims } = await auth();
  const sessionMeta = sessionClaims?.metadata;
  if (sessionMeta && typeof sessionMeta === "object") {
    const fromSession = accountTypeFromMetadata(sessionMeta as Record<string, unknown>);
    if (fromSession) return fromSession;
  }

  try {
    const api = await clerkClient();
    const user = await api.users.getUser(userId);
    return accountTypeFromMetadata(user.publicMetadata as Record<string, unknown>);
  } catch {
    return null;
  }
}

/**
 * Legacy users (pre-welcome flow) and admins/partners skip /welcome.
 * New users without accountType must pick one.
 */
export async function shouldSkipWelcome(userId: string): Promise<boolean> {
  const [admin, partner, accountType] = await Promise.all([
    isUserAdmin(userId),
    isUserPartner(userId),
    getUserAccountType(userId),
  ]);

  if (admin || partner) return true;
  if (accountType) return true;

  const [verifactu, invoice] = await Promise.all([
    prisma.userVerifactuAccount.findUnique({
      where: { userId },
      select: { userId: true },
    }),
    prisma.invoice.findFirst({
      where: { userId },
      select: { id: true },
    }),
  ]);

  return Boolean(verifactu || invoice);
}

/**
 * Integrators waiting for production approval (no partner role yet).
 */
export async function isPendingIntegrator(userId: string): Promise<boolean> {
  const [accountType, partner, admin] = await Promise.all([
    getUserAccountType(userId),
    isUserPartner(userId),
    isUserAdmin(userId),
  ]);
  if (admin || partner) return false;
  return accountType === "integrator";
}
