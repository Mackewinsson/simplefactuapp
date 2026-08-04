import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { requirePartner } from "@/lib/auth/partner";
import { PartnerNav } from "./PartnerNav";
import { privatePageMetadata } from "@/lib/seo/robots";

export const metadata: Metadata = privatePageMetadata;

async function isActivationPath(): Promise<boolean> {
  const h = await headers();
  const pathname = h.get("x-pathname") || "";
  return pathname === "/partner/activation" || pathname.startsWith("/partner/activation/");
}

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  // /partner/activation must be reachable before partner role is granted.
  if (await isActivationPath()) {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");
    return <div className="animate-fade-in-up">{children}</div>;
  }

  await requirePartner();

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="rounded-xl border border-accent/20 bg-accent-muted/50 px-4 py-3 text-sm text-accent-foreground-muted font-display font-semibold shadow-sm flex items-center gap-2.5">
        <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
        <span>
          Consola de integrador — gestiona los clientes vinculados a tu cuenta, sus certificados y envíos AEAT.
        </span>
      </div>
      <PartnerNav />
      {children}
    </div>
  );
}
