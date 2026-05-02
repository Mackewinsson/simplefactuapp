import { requireAdmin } from "@/lib/auth/admin";
import { getDiagnostics } from "@/lib/simplefactu/admin-server";
import Link from "next/link";

export default async function AdminDashboardPage() {
  await requireAdmin();

  let diag: Awaited<ReturnType<typeof getDiagnostics>> | null = null;
  let err: string | null = null;
  try {
    diag = await getDiagnostics();
  } catch (e: unknown) {
    err = e instanceof Error ? e.message : "No se pudo cargar diagnóstico";
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Dashboard admin</h1>

      {err ? (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{err}</p>
      ) : diag ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold text-gray-700">API</h2>
            <dl className="space-y-1 text-sm text-gray-600">
              <div>
                <dt className="inline text-gray-500">Versión:</dt>{" "}
                <dd className="inline">{diag.version ?? "—"}</dd>
              </div>
              <div>
                <dt className="inline text-gray-500">Node:</dt>{" "}
                <dd className="inline">{diag.nodeVersion ?? "—"}</dd>
              </div>
              <div>
                <dt className="inline text-gray-500">DB:</dt>{" "}
                <dd className="inline">
                  {diag.database?.dialect ?? "—"} {diag.database?.connected ? "(ok)" : ""}
                </dd>
              </div>
            </dl>
          </section>
          <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold text-gray-700">Worker</h2>
            <dl className="space-y-1 text-sm text-gray-600">
              <div>
                <dt className="inline text-gray-500">Habilitado:</dt>{" "}
                <dd className="inline">{diag.worker?.enabled ? "Sí" : "No"}</dd>
              </div>
              <div>
                <dt className="inline text-gray-500">Async mode:</dt>{" "}
                <dd className="inline">{diag.worker?.asyncMode ? "Sí" : "No"}</dd>
              </div>
              <div>
                <dt className="inline text-gray-500">Max reintentos:</dt>{" "}
                <dd className="inline">{diag.worker?.maxRetries ?? "—"}</dd>
              </div>
            </dl>
          </section>
          <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:col-span-2">
            <h2 className="mb-2 text-sm font-semibold text-gray-700">Jobs por estado</h2>
            <ul className="flex flex-wrap gap-3 text-sm">
              {diag.jobs?.byStatus &&
                Object.entries(diag.jobs.byStatus).map(([k, v]) => (
                  <li key={k} className="rounded bg-gray-100 px-2 py-1">
                    <span className="font-medium">{k}</span>: {String(v)}
                  </li>
                ))}
            </ul>
            <p className="mt-2 text-sm text-gray-600">
              PENDING/FAILED última hora:{" "}
              <span className="font-medium">{diag.jobs?.pendingFailedLastHour ?? 0}</span>
            </p>
          </section>
        </div>
      ) : null}

      <ul className="list-inside list-disc text-sm text-blue-700">
        <li>
          <Link href="/admin/tenants" className="hover:underline">
            Gestionar tenants
          </Link>
        </li>
        <li>
          <Link href="/admin/jobs" className="hover:underline">
            Explorar jobs AEAT
          </Link>
        </li>
        <li>
          <Link href="/admin/system" className="hover:underline">
            Métricas y rate limit
          </Link>
        </li>
      </ul>
    </div>
  );
}
