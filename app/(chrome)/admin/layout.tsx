import { requireAdmin } from "@/lib/auth/admin";
import { AdminNav } from "./AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-warning-outline bg-warning px-4 py-2 text-sm text-warning-deeper">
        Panel de administración: solo personal autorizado. Las acciones afectan a simplefactu y a los tenants.
      </div>
      <AdminNav />
      {children}
    </div>
  );
}
