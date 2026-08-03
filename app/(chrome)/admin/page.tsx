import { requireAdmin } from "@/lib/auth/admin";
import {
  getDiagnostics,
  getAdminOpsStatus,
  getExpiringCertificates,
} from "@/lib/simplefactu/admin-server";
import { probeApiReady } from "@/lib/simplefactu/public-health";
import Link from "next/link";
import { AdminOpsAlerts } from "./AdminOpsAlerts";

export default async function AdminDashboardPage() {
  await requireAdmin();

  let diag: Awaited<ReturnType<typeof getDiagnostics>> | null = null;
  let status: Awaited<ReturnType<typeof getAdminOpsStatus>> | null = null;
  let expiring: Awaited<ReturnType<typeof getExpiringCertificates>> | null = null;
  let err: string | null = null;
  const ready = await probeApiReady();
  try {
    const [d, s, e] = await Promise.all([
      getDiagnostics(),
      getAdminOpsStatus().catch(() => null),
      getExpiringCertificates(30).catch(() => null),
    ]);
    diag = d;
    status = s;
    expiring = e;
  } catch (e: unknown) {
    err = e instanceof Error ? e.message : "No se pudo cargar diagnóstico";
  }

  const deadCount = status?.jobs?.byStatus?.DEAD ?? diag?.jobs?.byStatus?.DEAD ?? 0;
  const stuckCount = status?.jobs?.stuck ?? 0;
  const flags = status?.flags;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <h1 className="text-3xl font-extrabold tracking-tight text-fg font-display">
        Operación plataforma
      </h1>

      {err ? (
        <p className="rounded-xl border border-danger-outline/50 bg-danger/80 px-4 py-3 text-sm text-danger-foreground font-semibold">
          {err}
        </p>
      ) : diag ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {(flags?.readOnlyMode || flags?.disableAeatSend || stuckCount > 0 || deadCount > 0) && (
            <section className="panel-premium rounded-2xl p-6 sm:col-span-2 border-warning-outline/50">
              <h2 className="mb-4 text-base font-bold text-fg font-display tracking-tight border-b border-outline-soft/60 pb-2">
                Cola de atención
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                <li className="rounded-lg border border-outline-soft bg-surface-muted/50 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase text-fg-subtle">Jobs DEAD</p>
                  <p className="mt-1 text-2xl font-extrabold text-danger-foreground">{deadCount}</p>
                  <Link href="/admin/jobs?status=DEAD" className="text-xs text-accent hover:underline">
                    Ver lista →
                  </Link>
                </li>
                <li className="rounded-lg border border-outline-soft bg-surface-muted/50 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase text-fg-subtle">Stuck PROCESSING</p>
                  <p className="mt-1 text-2xl font-extrabold text-warning-deep">{stuckCount}</p>
                  <p className="text-[11px] text-fg-subtle">&gt;10 min sin actualizar</p>
                </li>
                <li className="rounded-lg border border-outline-soft bg-surface-muted/50 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase text-fg-subtle">READ_ONLY_MODE</p>
                  <p
                    className={`mt-1 text-lg font-extrabold ${
                      flags?.readOnlyMode ? "text-danger-foreground" : "text-success-emphasis"
                    }`}
                  >
                    {flags?.readOnlyMode ? "ON" : "off"}
                  </p>
                </li>
                <li className="rounded-lg border border-outline-soft bg-surface-muted/50 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase text-fg-subtle">DISABLE_AEAT_SEND</p>
                  <p
                    className={`mt-1 text-lg font-extrabold ${
                      flags?.disableAeatSend ? "text-danger-foreground" : "text-success-emphasis"
                    }`}
                  >
                    {flags?.disableAeatSend ? "ON" : "off"}
                  </p>
                </li>
              </ul>
            </section>
          )}

          <section className="panel-premium rounded-2xl p-6">
            <h2 className="mb-4 text-base font-bold text-fg font-display tracking-tight border-b border-outline-soft/60 pb-2">
              API Servidor
            </h2>
            <dl className="space-y-2 text-sm text-fg-muted font-display">
              <div className="flex justify-between border-b border-outline-soft/30 pb-1">
                <dt className="text-fg-subtle font-semibold">Versión:</dt>
                <dd className="font-mono text-xs bg-surface-muted px-2 py-0.5 rounded border border-outline-soft/40">
                  {diag.version ?? "—"}
                </dd>
              </div>
              <div className="flex justify-between border-b border-outline-soft/30 pb-1">
                <dt className="text-fg-subtle font-semibold">Node.js:</dt>
                <dd className="font-mono text-xs">{diag.nodeVersion ?? "—"}</dd>
              </div>
              <div className="flex justify-between border-b border-outline-soft/30 pb-1">
                <dt className="text-fg-subtle font-semibold">Base de datos:</dt>
                <dd className="font-semibold text-success-emphasis flex items-center gap-1.5">
                  <span className="font-mono text-xs bg-surface-muted px-1.5 py-0.5 rounded text-fg-muted border border-outline-soft/40 font-normal">
                    {diag.database?.dialect ?? status?.database?.type ?? "—"}
                  </span>
                  {diag.database?.connected ? (
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-success-emphasis inline-block" />{" "}
                      Connected
                    </span>
                  ) : (
                    ""
                  )}
                </dd>
              </div>
            </dl>
          </section>
          <section className="panel-premium rounded-2xl p-6">
            <h2 className="mb-4 text-base font-bold text-fg font-display tracking-tight border-b border-outline-soft/60 pb-2">
              Worker de Jobs
            </h2>
            <dl className="space-y-2 text-sm text-fg-muted font-display">
              <div className="flex justify-between border-b border-outline-soft/30 pb-1">
                <dt className="text-fg-subtle font-semibold">Habilitado:</dt>
                <dd className="font-semibold">
                  {diag.worker?.enabled || status?.worker?.enabled ? (
                    <span className="text-success-emphasis">Sí</span>
                  ) : (
                    <span className="text-fg-subtle">No</span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between border-b border-outline-soft/30 pb-1">
                <dt className="text-fg-subtle font-semibold">Modo asíncrono:</dt>
                <dd className="font-semibold">
                  {diag.worker?.asyncMode ? (
                    <span className="text-accent">Sí</span>
                  ) : (
                    <span>No</span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between border-b border-outline-soft/30 pb-1">
                <dt className="text-fg-subtle font-semibold">Max reintentos:</dt>
                <dd className="font-mono text-xs bg-surface-muted px-2 py-0.5 rounded border border-outline-soft/40">
                  {diag.worker?.maxRetries ?? "—"}
                </dd>
              </div>
            </dl>
          </section>
          <section className="panel-premium rounded-2xl p-6 sm:col-span-2">
            <h2 className="mb-4 text-base font-bold text-fg font-display tracking-tight border-b border-outline-soft/60 pb-2">
              Jobs por estado
            </h2>
            <ul className="flex flex-wrap gap-2.5 text-xs font-display">
              {(status?.jobs?.byStatus ?? diag.jobs?.byStatus) &&
                Object.entries(status?.jobs?.byStatus ?? diag.jobs?.byStatus ?? {}).map(
                  ([k, v]) => {
                    let badgeColor =
                      "bg-surface-muted border-outline-soft/80 text-fg-muted";
                    if (k === "SUCCEEDED")
                      badgeColor =
                        "bg-success/50 border-success-outline/40 text-success-foreground";
                    if (k === "FAILED" || k === "DEAD")
                      badgeColor =
                        "bg-danger/50 border-danger-outline/40 text-danger-foreground font-bold";
                    if (k === "PENDING" || k === "PROCESSING")
                      badgeColor =
                        "bg-warning/50 border-warning-outline/40 text-warning-deep";
                    return (
                      <li
                        key={k}
                        className={`rounded-lg border px-2.5 py-1.5 flex items-center gap-1.5 shadow-sm font-semibold ${badgeColor}`}
                      >
                        <span className="font-bold font-mono">{k}</span>
                        <span className="bg-surface/80 rounded px-1.5 py-0.5 font-bold text-[10px] text-fg-muted shadow-sm">
                          {String(v)}
                        </span>
                      </li>
                    );
                  }
                )}
            </ul>
            <div className="mt-4 pt-3 border-t border-outline-soft/30 text-xs font-semibold text-fg-muted font-display flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent inline-block" />
              <span>PENDING/FAILED última hora:</span>
              <span className="font-mono text-sm font-extrabold text-fg bg-surface-muted px-2 py-0.5 rounded border border-outline-soft/40">
                {status?.jobs?.pendingFailedLastHour ?? diag.jobs?.pendingFailedLastHour ?? 0}
              </span>
            </div>
          </section>

          {expiring && expiring.count > 0 ? (
            <section className="panel-premium rounded-2xl p-6 sm:col-span-2">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-outline-soft/60 pb-2">
                <h2 className="text-base font-bold text-fg font-display tracking-tight">
                  Certificados por caducar / caducados ({expiring.count})
                </h2>
                <Link href="/admin/system" className="text-xs text-accent hover:underline">
                  Ver en Sistema →
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-xs">
                  <thead className="text-fg-subtle">
                    <tr>
                      <th className="py-1 pr-3">Tenant</th>
                      <th className="py-1 pr-3">NIF</th>
                      <th className="py-1 pr-3">Días</th>
                      <th className="py-1">notAfter</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-soft/40">
                    {expiring.certificates.slice(0, 8).map((c) => (
                      <tr key={c.tenantId}>
                        <td className="py-2 pr-3 font-mono">
                          <Link
                            href={`/admin/support?q=${encodeURIComponent(c.tenantId)}`}
                            className="text-accent hover:underline"
                          >
                            {c.tenantId}
                          </Link>
                        </td>
                        <td className="py-2 pr-3 font-mono">{c.nif ?? "—"}</td>
                        <td
                          className={`py-2 pr-3 font-bold ${
                            c.daysUntilExpiry < 0
                              ? "text-danger-foreground"
                              : "text-warning-deep"
                          }`}
                        >
                          {c.daysUntilExpiry}
                        </td>
                        <td className="py-2 font-mono text-fg-subtle">{c.notAfter ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          <AdminOpsAlerts diag={diag} ready={ready} />
        </div>
      ) : null}

      <div className="mt-8 pt-6 border-t border-outline-soft/60">
        <h2 className="text-lg font-bold text-fg font-display tracking-tight mb-4">
          Accesos directos
        </h2>
        <div className="grid gap-4 sm:grid-cols-3 font-display">
          <Link
            href="/admin/users"
            className="flex items-center justify-between rounded-xl border border-outline-soft bg-surface/80 p-4 shadow-sm hover:shadow-md hover:border-accent/30 hover:bg-surface transition-all duration-200 group transform hover:-translate-y-[1px]"
          >
            <span className="font-semibold text-fg-muted group-hover:text-fg transition-colors">
              Buscar usuarios
            </span>
            <span className="text-accent group-hover:translate-x-0.5 transition-transform font-bold">
              →
            </span>
          </Link>
          <Link
            href="/admin/support"
            className="flex items-center justify-between rounded-xl border border-outline-soft bg-surface/80 p-4 shadow-sm hover:shadow-md hover:border-accent/30 hover:bg-surface transition-all duration-200 group transform hover:-translate-y-[1px]"
          >
            <span className="font-semibold text-fg-muted group-hover:text-fg transition-colors">
              Hub de soporte
            </span>
            <span className="text-accent group-hover:translate-x-0.5 transition-transform font-bold">
              →
            </span>
          </Link>
          <Link
            href="/admin/jobs?status=DEAD"
            className="flex items-center justify-between rounded-xl border border-outline-soft bg-surface/80 p-4 shadow-sm hover:shadow-md hover:border-accent/30 hover:bg-surface transition-all duration-200 group transform hover:-translate-y-[1px]"
          >
            <span className="font-semibold text-fg-muted group-hover:text-fg transition-colors">
              Jobs DEAD
            </span>
            <span className="text-accent group-hover:translate-x-0.5 transition-transform font-bold">
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
