import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminMetrics, getRateLimitConfig } from "@/lib/simplefactu/admin-server";

function defaultDateRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to.getTime() - 7 * 86400000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}

export default async function AdminSystemPage({
  searchParams,
}: {
  searchParams: Promise<{ tenantId?: string; from?: string; to?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const defaults = defaultDateRange();
  const tenantId = sp.tenantId?.trim() ?? "";
  const from = sp.from?.trim() || defaults.from;
  const to = sp.to?.trim() || defaults.to;

  let rate: Awaited<ReturnType<typeof getRateLimitConfig>> | null = null;
  let rateErr: string | null = null;
  try {
    rate = await getRateLimitConfig();
  } catch (e: unknown) {
    rateErr = e instanceof Error ? e.message : "Error";
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

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin" className="text-sm text-accent hover:underline">
          ← Inicio
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-fg">Sistema (simplefactu)</h1>
      </div>

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
        <h2 className="mb-2 text-sm font-semibold text-fg">Métricas por tenant (rango)</h2>
        <p className="mb-3 text-xs text-fg-subtle">
          Requiere <code className="rounded bg-surface-muted px-1">tenantId</code> y fechas YYYY-MM-DD (API{" "}
          <code className="rounded bg-surface-muted px-1">GET /admin/metrics</code>).
        </p>
        <form className="mb-4 flex flex-wrap items-end gap-3 text-sm" method="get">
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
          <button type="submit" className="rounded bg-primary-hover px-3 py-1 text-primary-foreground hover:bg-primary-hover">
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
