import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminNav } from "./AdminNav";
import { privatePageMetadata } from "@/lib/seo/robots";

export const metadata: Metadata = privatePageMetadata;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="rounded-xl border border-warning-outline/65 bg-warning/60 px-4 py-3 text-sm text-warning-deeper font-display font-semibold shadow-sm flex items-center gap-2.5">
        <span className="h-2 w-2 rounded-full bg-warning-strong shrink-0 animate-pulse" />
        <span>Operación plataforma — solo operadores simplefactu autorizados. Las acciones modifican el estado global del sistema.</span>
      </div>
      <AdminNav />
      {children}
    </div>
  );
}
