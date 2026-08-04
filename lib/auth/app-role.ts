import "server-only";

import { isUserAdmin } from "@/lib/auth/admin";
import { isUserPartner } from "@/lib/auth/partner";
import { getAdminPreviewRole } from "@/lib/auth/admin-preview";

export type AppRole = "admin" | "partner" | "user";

export type NavLink = {
  href: string;
  label: string;
  badge?: "accent" | "warning";
};

/**
 * Dev-only: set DEV_FORCE_ROLE=partner|admin|user in .env.local to
 * override Clerk checks and preview any role with your own account.
 * Used by getNavLinks, requireAdmin, and requirePartner.
 */
export function devForceRole(): AppRole | null {
  if (process.env.NODE_ENV !== "development") return null;
  const forced = process.env.DEV_FORCE_ROLE?.trim().toLowerCase();
  if (forced === "admin" || forced === "partner" || forced === "user") return forced;
  return null;
}

/**
 * Build the navigation links visible to a given role.
 *
 * - partner-only: stripped nav — only their console + docs.
 * - admin: full autonomo nav + admin panel (+ partner if both roles).
 * - user (autonomo): full nav, no admin/partner.
 */
export async function getNavLinks(
  userId: string,
  options: { billingEnabled: boolean }
): Promise<NavLink[]> {
  const forced = devForceRole();

  let admin: boolean;
  let partner: boolean;

  if (forced) {
    admin = forced === "admin";
    partner = forced === "partner";
  } else {
    [admin, partner] = await Promise.all([
      isUserAdmin(userId),
      isUserPartner(userId),
    ]);
  }

  // Admin role preview override
  if (admin) {
    const preview = await getAdminPreviewRole(userId);
    if (preview === "partner") {
      return [
        { href: "/partner", label: "Consola integrador" },
        { href: "/docs", label: "Documentación" },
      ];
    }
    if (preview === "user") {
      const userLinks: NavLink[] = [
        { href: "/", label: "Inicio" },
        { href: "/invoices", label: "Facturas" },
        { href: "/customers", label: "Clientes" },
        { href: "/products", label: "Productos" },
        { href: "/settings/verifactu", label: "Ajustes AEAT" },
        { href: "/docs", label: "Documentación" },
      ];
      if (options.billingEnabled) {
        userLinks.push({ href: "/settings/billing", label: "Plan" });
      }
      return userLinks;
    }
  }

  if (partner && !admin) {
    return [
      { href: "/partner", label: "Consola integrador" },
      { href: "/docs", label: "Documentación" },
    ];
  }

  // Pending integrator (awaiting production approval): limited nav.
  if (!forced) {
    const { isPendingIntegrator } = await import("@/lib/auth/account-type");
    if (await isPendingIntegrator(userId)) {
      return [
        { href: "/partner/activation", label: "Activación" },
        { href: "/docs", label: "Documentación" },
      ];
    }
  }

  const links: NavLink[] = [
    { href: "/", label: "Inicio" },
    { href: "/invoices", label: "Facturas" },
    { href: "/customers", label: "Clientes" },
    { href: "/products", label: "Productos" },
    { href: "/settings/verifactu", label: "Ajustes AEAT" },
    { href: "/docs", label: "Documentación" },
  ];

  if (options.billingEnabled) {
    links.push({ href: "/settings/billing", label: "Plan" });
  }

  if (partner) {
    links.push({
      href: "/partner",
      label: "Consola integrador",
      badge: "accent",
    });
  }

  if (admin) {
    links.push({
      href: "/admin",
      label: "Operación plataforma",
      badge: "warning",
    });
  }

  return links;
}

/**
 * Determine default landing route for a logged-in user based on their role.
 * - partner-only (Gestoría / B2B): /partner
 * - admin (Plataforma Operador): /admin
 * - pending integrator (prod, awaiting approval): /partner/activation
 * - user (Autónomo / Pyme Web): /invoices
 */
export async function getDefaultAppRedirect(userId: string): Promise<string> {
  const forced = devForceRole();
  let admin: boolean;
  let partner: boolean;

  if (forced) {
    admin = forced === "admin";
    partner = forced === "partner";
  } else {
    [admin, partner] = await Promise.all([
      isUserAdmin(userId),
      isUserPartner(userId),
    ]);
  }

  if (admin) {
    const preview = await getAdminPreviewRole(userId);
    if (preview === "partner") return "/partner";
    if (preview === "user") return "/invoices";
    return "/admin";
  }

  if (partner && !admin) return "/partner";

  // Avoid circular import of account-type helpers at module top for nav-only paths;
  // lazy import keeps getNavLinks free of activation logic.
  const { isPendingIntegrator, getUserAccountType, shouldSkipWelcome } = await import(
    "@/lib/auth/account-type"
  );
  if (await isPendingIntegrator(userId)) return "/partner/activation";
  if (!(await shouldSkipWelcome(userId)) && !(await getUserAccountType(userId))) {
    return "/welcome";
  }

  return "/invoices";
}
