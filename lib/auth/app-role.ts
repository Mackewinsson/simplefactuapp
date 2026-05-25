import "server-only";

import { isUserAdmin } from "@/lib/auth/admin";
import { isUserPartner } from "@/lib/auth/partner";

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

  if (partner && !admin) {
    return [
      { href: "/partner", label: "Consola integrador" },
      { href: "/docs", label: "Documentación" },
    ];
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
