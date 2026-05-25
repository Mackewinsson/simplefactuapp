import { auth } from "@clerk/nextjs/server";
import { getNavLinks } from "@/lib/auth/app-role";
import { isBillingEnabled } from "@/lib/billing/feature";
import { ResponsiveAppNav } from "./ResponsiveAppNav";

export async function AppNav() {
  const { userId } = await auth();
  const links = userId
    ? await getNavLinks(userId, { billingEnabled: isBillingEnabled() })
    : [
        { href: "/", label: "Inicio" },
        { href: "/docs", label: "Documentación" },
      ];

  return <ResponsiveAppNav links={links} />;
}
