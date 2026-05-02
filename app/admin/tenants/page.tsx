import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { listTenants } from "@/lib/simplefactu/admin-server";

const PAGE_SIZE = 30;

export default async function AdminTenantsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  let data: Awaited<ReturnType<typeof listTenants>> | null = null;
  let err: string | null = null;
  try {
    data = await listTenants(PAGE_SIZE, offset);
  } catch (e: unknown) {
    err = e instanceof Error ? e.message : "Error al listar tenants";
  }

  const total = data?.pagination.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">Tenants (simplefactu)</h1>
      {err ? (
        <p className="text-sm text-red-700">{err}</p>
      ) : data ? (
        <>
          <p className="text-sm text-gray-600">
            Total: {total} — página {page} de {totalPages}
          </p>
          <div className="overflow-x-auto rounded border border-gray-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Nombre</th>
                  <th className="px-3 py-2">Plan</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {data.tenants.map((t) => (
                  <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 font-mono text-xs">{t.id}</td>
                    <td className="px-3 py-2">{t.name ?? "—"}</td>
                    <td className="px-3 py-2">{t.plan_id}</td>
                    <td className="px-3 py-2">{t.status}</td>
                    <td className="px-3 py-2">
                      <Link href={`/admin/tenants/${encodeURIComponent(t.id)}`} className="text-blue-600 hover:underline">
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-4 text-sm">
            {page > 1 ? (
              <Link href={`/admin/tenants?page=${page - 1}`} className="text-blue-600 hover:underline">
                Anterior
              </Link>
            ) : null}
            {page < totalPages ? (
              <Link href={`/admin/tenants?page=${page + 1}`} className="text-blue-600 hover:underline">
                Siguiente
              </Link>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
