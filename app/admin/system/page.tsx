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
        <Link href="/admin" className="text-sm text-blue-600 hover:underline">
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-gray-900">Sistema (simplefactu)</h1>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-gray-800">Rate limit (config)</h2>
        {rateErr ? (
          <p className="text-sm text-red-700">{rateErr}</p>
        ) : (
          <pre className="max-h-48 overflow-auto rounded bg-gray-50 p-3 text-xs">
            {JSON.stringify(rate, null, 2)}
          </pre>
        )}
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-gray-800">Métricas por tenant (rango)</h2>
        <p className="mb-3 text-xs text-gray-500">
          Requiere <code className="rounded bg-gray-100 px-1">tenantId</code> y fechas YYYY-MM-DD (API{" "}
          <code className="rounded bg-gray-100 px-1">GET /admin/metrics</code>).
        </p>
        <form className="mb-4 flex flex-wrap items-end gap-3 text-sm" method="get">
          <label className="block">
            <span className="text-gray-600">Tenant ID</span>
            <input
              name="tenantId"
              type="text"
              defaultValue={tenantId}
              placeholder="sf_user_..."
              className="mt-1 block w-56 rounded border border-gray-300 px-2 py-1 font-mono text-xs"
            />
          </label>
          <label className="block">
            <span className="text-gray-600">Desde</span>
            <input
              name="from"
              type="text"
              defaultValue={from}
              pattern="\d{4}-\d{2}-\d{2}"
              className="mt-1 block rounded border border-gray-300 px-2 py-1 font-mono text-xs"
            />
          </label>
          <label className="block">
            <span className="text-gray-600">Hasta</span>
            <input
              name="to"
              type="text"
              defaultValue={to}
              pattern="\d{4}-\d{2}-\d{2}"
              className="mt-1 block rounded border border-gray-300 px-2 py-1 font-mono text-xs"
            />
          </label>
          <button type="submit" className="rounded bg-gray-800 px-3 py-1 text-white hover:bg-gray-700">
            Consultar
          </button>
        </form>
        {!tenantId ? (
          <p className="text-sm text-gray-500">Indica un tenant para cargar métricas.</p>
        ) : metricsErr ? (
          <p className="text-sm text-red-700">{metricsErr}</p>
        ) : metrics ? (
          <pre className="max-h-96 overflow-auto rounded bg-gray-50 p-3 text-xs">
            {JSON.stringify({ totals: metrics.totals, metrics: metrics.metrics }, null, 2)}
          </pre>
        ) : null}
      </section>
    </div>
  );
}
