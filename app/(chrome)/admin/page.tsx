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
    <div className="space-y-8 animate-fade-in-up">
      <h1 className="text-3xl font-extrabold tracking-tight text-fg font-display">Panel de administración</h1>

      {err ? (
        <p className="rounded-xl border border-danger-outline/50 bg-danger/80 px-4 py-3 text-sm text-danger-foreground font-semibold">{err}</p>
      ) : diag ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <section className="panel-premium rounded-2xl p-6">
            <h2 className="mb-4 text-base font-bold text-fg font-display tracking-tight border-b border-outline-soft/60 pb-2">API Servidor</h2>
            <dl className="space-y-2 text-sm text-fg-muted font-display">
              <div className="flex justify-between border-b border-outline-soft/30 pb-1">
                <dt className="text-fg-subtle font-semibold">Versión:</dt>
                <dd className="font-mono text-xs bg-surface-muted px-2 py-0.5 rounded border border-outline-soft/40">{diag.version ?? "—"}</dd>
              </div>
              <div className="flex justify-between border-b border-outline-soft/30 pb-1">
                <dt className="text-fg-subtle font-semibold">Node.js:</dt>
                <dd className="font-mono text-xs">{diag.nodeVersion ?? "—"}</dd>
              </div>
              <div className="flex justify-between border-b border-outline-soft/30 pb-1">
                <dt className="text-fg-subtle font-semibold">Base de datos:</dt>
                <dd className="font-semibold text-success-emphasis flex items-center gap-1.5">
                  <span className="font-mono text-xs bg-surface-muted px-1.5 py-0.5 rounded text-fg-muted border border-outline-soft/40 font-normal">{diag.database?.dialect ?? "—"}</span>
                  {diag.database?.connected ? (
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-success-emphasis inline-block" /> Connected
                    </span>
                  ) : ""}
                </dd>
              </div>
            </dl>
          </section>
          <section className="panel-premium rounded-2xl p-6">
            <h2 className="mb-4 text-base font-bold text-fg font-display tracking-tight border-b border-outline-soft/60 pb-2">Worker de Jobs</h2>
            <dl className="space-y-2 text-sm text-fg-muted font-display">
              <div className="flex justify-between border-b border-outline-soft/30 pb-1">
                <dt className="text-fg-subtle font-semibold">Habilitado:</dt>
                <dd className="font-semibold">{diag.worker?.enabled ? <span className="text-success-emphasis">Sí</span> : <span className="text-fg-subtle">No</span>}</dd>
              </div>
              <div className="flex justify-between border-b border-outline-soft/30 pb-1">
                <dt className="text-fg-subtle font-semibold">Modo asíncrono:</dt>
                <dd className="font-semibold">{diag.worker?.asyncMode ? <span className="text-accent">Sí</span> : <span>No</span>}</dd>
              </div>
              <div className="flex justify-between border-b border-outline-soft/30 pb-1">
                <dt className="text-fg-subtle font-semibold">Max reintentos:</dt>
                <dd className="font-mono text-xs bg-surface-muted px-2 py-0.5 rounded border border-outline-soft/40">{diag.worker?.maxRetries ?? "—"}</dd>
              </div>
            </dl>
          </section>
          <section className="panel-premium rounded-2xl p-6 sm:col-span-2">
            <h2 className="mb-4 text-base font-bold text-fg font-display tracking-tight border-b border-outline-soft/60 pb-2">Jobs por estado</h2>
            <ul className="flex flex-wrap gap-2.5 text-xs font-display">
              {diag.jobs?.byStatus &&
                Object.entries(diag.jobs.byStatus).map(([k, v]) => {
                  let badgeColor = "bg-surface-muted border-outline-soft/80 text-fg-muted";
                  if (k === "SUCCEEDED") badgeColor = "bg-success/50 border-success-outline/40 text-success-foreground";
                  if (k === "FAILED" || k === "DEAD") badgeColor = "bg-danger/50 border-danger-outline/40 text-danger-foreground font-bold";
                  if (k === "PENDING" || k === "PROCESSING") badgeColor = "bg-warning/50 border-warning-outline/40 text-warning-deep";
                  return (
                    <li key={k} className={`rounded-lg border px-2.5 py-1.5 flex items-center gap-1.5 shadow-sm font-semibold ${badgeColor}`}>
                      <span className="font-bold font-mono">{k}</span>
                      <span className="bg-surface/80 rounded px-1.5 py-0.5 font-bold text-[10px] text-fg-muted shadow-sm">{String(v)}</span>
                    </li>
                  );
                })}
            </ul>
            <div className="mt-4 pt-3 border-t border-outline-soft/30 text-xs font-semibold text-fg-muted font-display flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent inline-block" />
              <span>PENDING/FAILED última hora:</span>
              <span className="font-mono text-sm font-extrabold text-fg bg-surface-muted px-2 py-0.5 rounded border border-outline-soft/40">{diag.jobs?.pendingFailedLastHour ?? 0}</span>
            </div>
          </section>
          <AdminOpsAlerts diag={diag} ready={ready} />
        </div>
      ) : null}

      <div className="mt-8 pt-6 border-t border-outline-soft/60">
        <h2 className="text-lg font-bold text-fg font-display tracking-tight mb-4">Accesos Directos Administrativos</h2>
        <div className="grid gap-4 sm:grid-cols-3 font-display">
          <Link
            href="/admin/tenants"
            className="flex items-center justify-between rounded-xl border border-outline-soft bg-surface/80 p-4 shadow-sm hover:shadow-md hover:border-accent/30 hover:bg-surface transition-all duration-200 group transform hover:-translate-y-[1px]"
          >
            <span className="font-semibold text-fg-muted group-hover:text-fg transition-colors">Gestionar Tenants</span>
            <span className="text-accent group-hover:translate-x-0.5 transition-transform font-bold">→</span>
          </Link>
          <Link
            href="/admin/jobs"
            className="flex items-center justify-between rounded-xl border border-outline-soft bg-surface/80 p-4 shadow-sm hover:shadow-md hover:border-accent/30 hover:bg-surface transition-all duration-200 group transform hover:-translate-y-[1px]"
          >
            <span className="font-semibold text-fg-muted group-hover:text-fg transition-colors">Explorar Jobs AEAT</span>
            <span className="text-accent group-hover:translate-x-0.5 transition-transform font-bold">→</span>
          </Link>
          <Link
            href="/admin/system"
            className="flex items-center justify-between rounded-xl border border-outline-soft bg-surface/80 p-4 shadow-sm hover:shadow-md hover:border-accent/30 hover:bg-surface transition-all duration-200 group transform hover:-translate-y-[1px]"
          >
            <span className="font-semibold text-fg-muted group-hover:text-fg transition-colors">Métricas y Rate Limit</span>
            <span className="text-accent group-hover:translate-x-0.5 transition-transform font-bold">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
