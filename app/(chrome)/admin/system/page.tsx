import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import {
  getAdminMetrics,
  getAdminMetricsGlobal,
  getDiagnostics,
  getExpiringCertificates,
  getRateLimitConfig,
} from "@/lib/simplefactu/admin-server";
import { probeApiReady } from "@/lib/simplefactu/public-health";
import { AdminOpsAlerts } from "../AdminOpsAlerts";

function defaultDateRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to.getTime() - 7 * 86400000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}

export default async function AdminSystemPage({
  searchParams,
}: {
  searchParams: Promise<{ tenantId?: string; from?: string; to?: string; certDays?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const defaults = defaultDateRange();
  const tenantId = sp.tenantId?.trim() ?? "";
  const from = sp.from?.trim() || defaults.from;
  const to = sp.to?.trim() || defaults.to;
  const certDays = Math.min(Math.max(parseInt(sp.certDays ?? "30", 10) || 30, 1), 365);

  const ready = await probeApiReady();

  let diag: Awaited<ReturnType<typeof getDiagnostics>> | null = null;
  let diagErr: string | null = null;
  try {
    diag = await getDiagnostics();
  } catch (e: unknown) {
    diagErr = e instanceof Error ? e.message : "Error";
  }

  let rate: Awaited<ReturnType<typeof getRateLimitConfig>> | null = null;
  let rateErr: string | null = null;
  try {
    rate = await getRateLimitConfig();
  } catch (e: unknown) {
    rateErr = e instanceof Error ? e.message : "Error";
  }

  let globalMetrics: Awaited<ReturnType<typeof getAdminMetricsGlobal>> | null = null;
  let globalMetricsErr: string | null = null;
  try {
    globalMetrics = await getAdminMetricsGlobal(from, to);
  } catch (e: unknown) {
    globalMetricsErr = e instanceof Error ? e.message : "Error";
  }

  let metrics: Awaited<ReturnType<typeof getAdminMetrics>> | null = null;
  let metricsErr: string | null = null;
  if (tenantId) {
    try {
      metrics = await getAdminMetrics(tenantId, from, to);
    } catch (e: unknown) {
      metricsErr = e instanceof Error ? e.message : "Error";
    }
  }

  let expiring: Awaited<ReturnType<typeof getExpiringCertificates>> | null = null;
  let expiringErr: string | null = null;
  try {
    expiring = await getExpiringCertificates(certDays);
  } catch (e: unknown) {
    expiringErr = e instanceof Error ? e.message : "Error";
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin" className="text-sm text-accent hover:underline">
          ← Inicio
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-fg">Sistema (simplefactu)</h1>
      </div>

      {diagErr ? (
        <p className="rounded border border-danger-outline bg-danger px-3 py-2 text-sm text-danger-foreground">
          Diagnóstico API: {diagErr}
        </p>
      ) : (
        <AdminOpsAlerts diag={diag} ready={ready} />
      )}

      <section className="rounded-lg border border-outline-soft bg-surface p-4">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-fg">Certificados por caducar</h2>
            <p className="mt-1 text-xs text-fg-subtle">
              Tenants con <code className="rounded bg-surface-muted px-1">notAfter</code> dentro de{" "}
              {certDays} días (incluye ya caducados).
            </p>
          </div>
          <form method="get" className="flex items-end gap-2 text-sm">
            <input type="hidden" name="from" value={from} />
            <input type="hidden" name="to" value={to} />
            {tenantId ? <input type="hidden" name="tenantId" value={tenantId} /> : null}
            <label className="block">
              <span className="text-fg-muted">Días</span>
              <input
                name="certDays"
                type="number"
                min={1}
                max={365}
                defaultValue={certDays}
                className="mt-1 block w-20 rounded border border-outline px-2 py-1 font-mono text-xs"
              />
            </label>
            <button type="submit" className="btn btn-sm btn-secondary">
              Filtrar
            </button>
          </form>
        </div>
        {expiringErr ? (
          <p className="text-sm text-danger-foreground">{expiringErr}</p>
        ) : expiring && expiring.count === 0 ? (
          <p className="text-sm text-fg-subtle">Ningún certificado en ventana de {certDays} días.</p>
        ) : expiring ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="border-b border-outline-soft text-fg-subtle">
                <tr>
                  <th className="py-2 pr-3">Tenant</th>
                  <th className="py-2 pr-3">NIF</th>
                  <th className="py-2 pr-3">CN</th>
                  <th className="py-2 pr-3">Días</th>
                  <th className="py-2">notAfter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-soft/40">
                {expiring.certificates.map((c) => (
                  <tr key={c.tenantId}>
                    <td className="py-2 pr-3 font-mono">
                      <Link
                        href={`/admin/tenants/${encodeURIComponent(c.tenantId)}`}
                        className="text-accent hover:underline"
                      >
                        {c.tenantId}
                      </Link>
                    </td>
                    <td className="py-2 pr-3 font-mono">{c.nif ?? "—"}</td>
                    <td className="py-2 pr-3">{c.commonName ?? "—"}</td>
                    <td
                      className={`py-2 pr-3 font-bold ${
                        c.daysUntilExpiry < 0 ? "text-danger-foreground" : "text-warning-deep"
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
        ) : null}
      </section>

      <section className="rounded-lg border border-outline-soft bg-surface p-4">
        <h2 className="mb-2 text-sm font-semibold text-fg">
          Límite de peticiones (configuración)
        </h2>
        {rateErr ? (
          <p className="text-sm text-danger-foreground">{rateErr}</p>
        ) : (
          <pre className="max-h-48 overflow-auto rounded bg-surface-hover p-3 text-xs">
            {JSON.stringify(rate, null, 2)}
          </pre>
        )}
      </section>

      <section className="rounded-lg border border-outline-soft bg-surface p-4">
        <h2 className="mb-2 text-sm font-semibold text-fg">
          Métricas globales ({from} → {to})
        </h2>
        <p className="mb-3 text-xs text-fg-subtle">
          Actividad total de la plataforma (API agrega sin{" "}
          <code className="rounded bg-surface-muted px-1">tenantId</code>).
        </p>
        {globalMetricsErr ? (
          <p className="text-sm text-danger-foreground">{globalMetricsErr}</p>
        ) : globalMetrics ? (
          <pre className="max-h-48 overflow-auto rounded bg-surface-hover p-3 text-xs">
            {JSON.stringify({ scope: globalMetrics.scope, totals: globalMetrics.totals }, null, 2)}
          </pre>
        ) : null}
      </section>

      <section className="rounded-lg border border-outline-soft bg-surface p-4">
        <h2 className="mb-2 text-sm font-semibold text-fg">Métricas por tenant (rango)</h2>
        <p className="mb-3 text-xs text-fg-subtle">
          Requiere <code className="rounded bg-surface-muted px-1">tenantId</code> y fechas YYYY-MM-DD.
        </p>
        <form className="mb-4 flex flex-wrap items-end gap-3 text-sm" method="get">
          <input type="hidden" name="certDays" value={String(certDays)} />
          <label className="block">
            <span className="text-fg-muted">Tenant ID</span>
            <input
              name="tenantId"
              type="text"
              defaultValue={tenantId}
              placeholder="sf_user_..."
              className="mt-1 block w-56 rounded border border-outline px-2 py-1 font-mono text-xs"
            />
          </label>
          <label className="block">
            <span className="text-fg-muted">Desde</span>
            <input
              name="from"
              type="text"
              defaultValue={from}
              pattern="\d{4}-\d{2}-\d{2}"
              className="mt-1 block rounded border border-outline px-2 py-1 font-mono text-xs"
            />
          </label>
          <label className="block">
            <span className="text-fg-muted">Hasta</span>
            <input
              name="to"
              type="text"
              defaultValue={to}
              pattern="\d{4}-\d{2}-\d{2}"
              className="mt-1 block rounded border border-outline px-2 py-1 font-mono text-xs"
            />
          </label>
          <button type="submit" className="btn btn-sm btn-primary">
            Consultar
          </button>
        </form>
        {!tenantId ? (
          <p className="text-sm text-fg-subtle">Indica un tenant para cargar métricas.</p>
        ) : metricsErr ? (
          <p className="text-sm text-danger-foreground">{metricsErr}</p>
        ) : metrics ? (
          <pre className="max-h-96 overflow-auto rounded bg-surface-hover p-3 text-xs">
            {JSON.stringify({ totals: metrics.totals, metrics: metrics.metrics }, null, 2)}
          </pre>
        ) : null}
      </section>
    </div>
  );
}
