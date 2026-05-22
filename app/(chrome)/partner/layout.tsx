import Link from "next/link";
import { requirePartner } from "@/lib/auth/partner";

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  await requirePartner();

  const linkClass = "text-sm text-fg-muted hover:text-fg hover:underline";

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-accent-outline bg-accent-muted px-4 py-2 text-sm text-accent-foreground-muted">
        Panel de gestoría: gestiona autónomos (sub-tenants) con tu clave partner. No uses la
        clave de administración global para el día a día.
      </div>
      <nav className="flex flex-wrap gap-x-6 gap-y-2 border-b border-outline-soft pb-3">
        <Link href="/partner" className={linkClass}>
          Autónomos
        </Link>
        <Link href="/partner/tenants/new" className={linkClass}>
          Alta autónomo
        </Link>
        <Link href="/invoices" className={`${linkClass} ml-auto`}>
          Volver a la app
        </Link>
      </nav>
      {children}
    </div>
  );
}
