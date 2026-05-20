import { requireAdmin } from "@/lib/auth/admin";
import { RetryJobForm } from "@/app/(chrome)/admin/support/RetryJobForm";

export default async function AdminSupportPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-fg">Soporte</h1>
      <section className="rounded-lg border border-outline-soft bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold text-fg">Reintentar job AEAT</h2>
        <RetryJobForm />
      </section>
    </div>
  );
}
