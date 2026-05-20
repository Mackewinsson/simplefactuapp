import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  const linkClass = "text-sm text-fg-muted hover:text-fg hover:underline";

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-warning-outline bg-warning px-4 py-2 text-sm text-warning-deeper">
        Panel de administración: solo personal autorizado. Las acciones afectan a simplefactu y a los tenants.
      </div>
      <nav className="flex flex-wrap gap-x-6 gap-y-2 border-b border-outline-soft pb-3">
        <Link href="/admin" className={linkClass}>
          Inicio
        </Link>
        <Link href="/admin/tenants" className={linkClass}>
          Tenants
        </Link>
        <Link href="/admin/users" className={linkClass}>
          Usuarios (Clerk)
        </Link>
        <Link href="/admin/jobs" className={linkClass}>
          Jobs AEAT
        </Link>
        <Link href="/admin/system" className={linkClass}>
          Sistema
        </Link>
        <Link href="/admin/support" className={linkClass}>
          Soporte
        </Link>
        <Link href="/admin/audit" className={linkClass}>
          Auditoría
        </Link>
        <Link href="/admin/leads" className={linkClass}>
          Leads
        </Link>
        <Link href="/invoices" className={`${linkClass} ml-auto`}>
          Volver a la app
        </Link>
      </nav>
      {children}
    </div>
  );
}
