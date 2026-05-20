import { requireAdmin } from "@/lib/auth/admin";
import { getDiagnostics } from "@/lib/simplefactu/admin-server";
import { probeApiReady } from "@/lib/simplefactu/public-health";
import Link from "next/link";
import { AdminOpsAlerts } from "./AdminOpsAlerts";

export default async function AdminDashboardPage() {
  await requireAdmin();

  let diag: Awaited<ReturnType<typeof getDiagnostics>> | null = null;
  let err: string | null = null;
  const ready = await probeApiReady();
  try {
    diag = await getDiagnostics();
  } catch (e: unknown) {
    err = e instanceof Error ? e.message : "No se pudo cargar diagnóstico";
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-fg">Panel de administración</h1>

      {err ? (
        <p className="rounded border border-danger-outline bg-danger px-3 py-2 text-sm text-danger-foreground">{err}</p>
      ) : diag ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <section className="rounded-lg border border-outline-soft bg-surface p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold text-fg-muted">API</h2>
            <dl className="space-y-1 text-sm text-fg-muted">
              <div>
                <dt className="inline text-fg-subtle">Versión:</dt>{" "}
                <dd className="inline">{diag.version ?? "—"}</dd>
              </div>
              <div>
                <dt className="inline text-fg-subtle">Node:</dt>{" "}
                <dd className="inline">{diag.nodeVersion ?? "—"}</dd>
              </div>
              <div>
                <dt className="inline text-fg-subtle">DB:</dt>{" "}
                <dd className="inline">
                  {diag.database?.dialect ?? "—"} {diag.database?.connected ? "(ok)" : ""}
                </dd>
              </div>
            </dl>
          </section>
          <section className="rounded-lg border border-outline-soft bg-surface p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold text-fg-muted">Worker</h2>
            <dl className="space-y-1 text-sm text-fg-muted">
              <div>
                <dt className="inline text-fg-subtle">Habilitado:</dt>{" "}
                <dd className="inline">{diag.worker?.enabled ? "Sí" : "No"}</dd>
              </div>
              <div>
                <dt className="inline text-fg-subtle">Modo asíncrono:</dt>{" "}
                <dd className="inline">{diag.worker?.asyncMode ? "Sí" : "No"}</dd>
              </div>
              <div>
                <dt className="inline text-fg-subtle">Max reintentos:</dt>{" "}
                <dd className="inline">{diag.worker?.maxRetries ?? "—"}</dd>
              </div>
            </dl>
          </section>
          <section className="rounded-lg border border-outline-soft bg-surface p-4 shadow-sm sm:col-span-2">
            <h2 className="mb-2 text-sm font-semibold text-fg-muted">Jobs por estado</h2>
            <ul className="flex flex-wrap gap-3 text-sm">
              {diag.jobs?.byStatus &&
                Object.entries(diag.jobs.byStatus).map(([k, v]) => (
                  <li key={k} className="rounded bg-surface-muted px-2 py-1">
                    <span className="font-medium">{k}</span>: {String(v)}
                  </li>
                ))}
            </ul>
            <p className="mt-2 text-sm text-fg-muted">
              PENDING/FAILED última hora:{" "}
              <span className="font-medium">{diag.jobs?.pendingFailedLastHour ?? 0}</span>
            </p>
          </section>
          <AdminOpsAlerts diag={diag} ready={ready} />
        </div>
      ) : null}

      <ul className="list-inside list-disc text-sm text-accent-hover">
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
