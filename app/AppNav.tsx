import { auth } from "@clerk/nextjs/server";
import { isUserAdmin } from "@/lib/auth/admin";
import { isBillingEnabled } from "@/lib/billing/feature";
import { ResponsiveAppNav } from "./ResponsiveAppNav";

export async function AppNav() {
  const { userId } = await auth();
  const showAdmin = userId ? await isUserAdmin(userId) : false;
  const showBilling = isBillingEnabled();
  const links: Array<{ href: string; label: string }> = [
    { href: "/", label: "Inicio" },
    { href: "/invoices", label: "Facturas" },
    { href: "/invoices/new", label: "Nueva factura" },
    { href: "/customers", label: "Clientes" },
    { href: "/products", label: "Productos" },
    { href: "/settings/verifactu", label: "Verifactu" },
    { href: "/docs", label: "Documentación" },
  ];

  if (showBilling) links.push({ href: "/settings/billing", label: "Plan" });
  if (showAdmin) links.push({ href: "/admin", label: "Administración" });

  return (
    <ResponsiveAppNav links={links} />
  );
}
