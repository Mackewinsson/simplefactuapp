import "server-only";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { isUserAdmin } from "@/lib/auth/admin";

export const IMPERSONATE_COOKIE_NAME = "sf_admin_impersonate_tenant_id";
export const IMPERSONATE_NAME_COOKIE_NAME = "sf_admin_impersonate_tenant_name";

export type ImpersonatedTenant = {
  tenantId: string;
  name?: string;
};

/**
 * Get active impersonated tenant info if current user is an admin.
 * Returns null if not impersonating or user is not an admin.
 */
export async function getAdminImpersonatedTenant(
  userId: string
): Promise<ImpersonatedTenant | null> {
  const isAdmin = await isUserAdmin(userId);
  if (!isAdmin) return null;

  const cookieStore = await cookies();
  const tenantId = cookieStore.get(IMPERSONATE_COOKIE_NAME)?.value?.trim();
  if (!tenantId) return null;

  const name = cookieStore.get(IMPERSONATE_NAME_COOKIE_NAME)?.value?.trim();
  return { tenantId, name: name || undefined };
}

/**
 * Resolve the Clerk userId whose local Prisma data (invoices, customers, …)
 * should be shown while an admin is impersonating a tenant.
 *
 * Prefers DB mapping (UserVerifactuAccount / UserPartnerAccount), then the
 * `sf_<clerkId>` / `rp_<clerkId>` convention. Returns null for API-only
 * subtenants with no Clerk account.
 */
export async function resolveImpersonatedClerkUserId(
  tenantId: string
): Promise<string | null> {
  const [vf, partner] = await Promise.all([
    prisma.userVerifactuAccount.findFirst({
      where: { simplefactuTenantId: tenantId },
      select: { userId: true },
    }),
    prisma.userPartnerAccount.findFirst({
      where: { partnerTenantId: tenantId },
      select: { userId: true },
    }),
  ]);
  if (vf?.userId) return vf.userId;
  if (partner?.userId) return partner.userId;

  if (tenantId.startsWith("sf_") || tenantId.startsWith("rp_")) {
    const derived = tenantId.slice(3);
    if (derived.startsWith("user_")) return derived;
  }
  return null;
}

/**
 * Effective app user for local data when the session user may be an admin
 * impersonating another tenant. Falls back to the session userId.
 */
export async function getEffectiveUserId(sessionUserId: string): Promise<string> {
  const imp = await getAdminImpersonatedTenant(sessionUserId);
  if (!imp) return sessionUserId;
  const target = await resolveImpersonatedClerkUserId(imp.tenantId);
  return target ?? sessionUserId;
}
