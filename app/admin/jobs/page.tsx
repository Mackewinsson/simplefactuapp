import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { listAdminJobs } from "@/lib/simplefactu/admin-server";

const PAGE_SIZE = 40;

const STATUSES = ["", "PENDING", "PROCESSING", "SUCCEEDED", "FAILED", "DEAD"];

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tenant_id?: string; status?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;
  const tenantId = sp.tenant_id?.trim() || undefined;
  const status = sp.status?.trim() || undefined;

  let data: Awaited<ReturnType<typeof listAdminJobs>> | null = null;
  let err: string | null = null;
  try {
    data = await listAdminJobs({
      tenantId,
      status,
      limit: PAGE_SIZE,
      offset,
    });
  } catch (e: unknown) {
    err = e instanceof Error ? e.message : "Error al listar jobs";
  }

  const total = data?.pagination.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const qs = new URLSearchParams();
  if (tenantId) qs.set("tenant_id", tenantId);
  if (status) qs.set("status", status);

  function hrefForPage(p: number) {
    const q = new URLSearchParams(qs);
    q.set("page", String(p));
    return `/admin/jobs?${q}`;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">Jobs AEAT</h1>

      <form className="flex flex-wrap items-end gap-3 rounded border border-gray-200 bg-white p-3 text-sm" method="get">
        <label className="block">
          <span className="text-gray-600">Tenant ID</span>
          <input
            name="tenant_id"
            type="text"
            defaultValue={tenantId ?? ""}
            placeholder="sf_user_..."
            className="mt-1 block w-56 rounded border border-gray-300 px-2 py-1 font-mono text-xs"
          />
        </label>
        <label className="block">
          <span className="text-gray-600">Estado</span>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="mt-1 block rounded border border-gray-300 px-2 py-1"
          >
            {STATUSES.map((s) => (
              <option key={s || "all"} value={s}>
                {s || "(todos)"}
              </option>
            ))}
          </select>
        </label>
        <input type="hidden" name="page" value="1" />
        <button type="submit" className="rounded bg-gray-800 px-3 py-1 text-white hover:bg-gray-700">
          Filtrar
        </button>
      </form>

      {err ? <p className="text-sm text-red-700">{err}</p> : null}

      {data ? (
        <>
          <p className="text-sm text-gray-600">
            Total: {total} — página {page} de {totalPages}
          </p>
          <div className="overflow-x-auto rounded border border-gray-200 bg-white">
            <table className="min-w-full text-left text-xs">
              <thead className="border-b border-gray-200 bg-gray-50 text-[10px] uppercase text-gray-500">
                <tr>
                  <th className="px-2 py-2">ID</th>
                  <th className="px-2 py-2">Tenant</th>
                  <th className="px-2 py-2">Tipo</th>
                  <th className="px-2 py-2">Estado</th>
                  <th className="px-2 py-2">Intentos</th>
                  <th className="px-2 py-2">Actualizado</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {data.jobs.map((j) => (
                  <tr key={j.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-2 py-2 font-mono">{j.id.slice(0, 8)}…</td>
                    <td className="max-w-[140px] truncate px-2 py-2 font-mono" title={j.tenant_id}>
                      {j.tenant_id}
                    </td>
                    <td className="px-2 py-2">{j.type}</td>
                    <td className="px-2 py-2">{j.status}</td>
                    <td className="px-2 py-2">
                      {j.attempts}/{j.max_attempts}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">{j.updated_at}</td>
                    <td className="px-2 py-2">
                      <Link href={`/admin/jobs/${encodeURIComponent(j.id)}`} className="text-blue-600 hover:underline">
                        Detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-4 text-sm">
            {page > 1 ? (
              <Link href={hrefForPage(page - 1)} className="text-blue-600 hover:underline">
                Anterior
              </Link>
            ) : null}
            {page < totalPages ? (
              <Link href={hrefForPage(page + 1)} className="text-blue-600 hover:underline">
                Siguiente
              </Link>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
