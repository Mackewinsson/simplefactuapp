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
    <div className="space-y-6 font-display animate-fade-in-up">
      <div>
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-bold text-fg-subtle hover:text-fg transition-colors group mb-3">
          <span className="transform group-hover:-translate-x-0.5 transition-transform">←</span> Volver a Administración
        </Link>
        <h1 className="text-3.5xl font-black tracking-tight text-fg">Trabajos AEAT (Jobs)</h1>
        <p className="mt-1.5 text-sm text-fg-muted font-sans font-medium">
          Control de envíos asíncronos Verifactu, reintentos y estados de comunicación con la Agencia Tributaria.
        </p>
      </div>

      {/* Filters Form */}
      <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-outline-soft/80 bg-surface/50 backdrop-blur-md p-4 text-xs font-display" method="get">
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-fg-subtle">Tenant ID</span>
          <input
            name="tenant_id"
            type="text"
            defaultValue={tenantId ?? ""}
            placeholder="sf_user_..."
            className="input w-56 rounded-xl border-outline-soft/80 py-2 px-3 focus:border-accent-outline focus:ring-2 focus:ring-accent-outline/15 font-mono text-xs shadow-sm bg-surface/50"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-fg-subtle">Estado</span>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="input w-40 rounded-xl border-outline-soft/80 py-2 px-3 focus:border-accent-outline focus:ring-2 focus:ring-accent-outline/15 text-xs shadow-sm bg-surface/50 font-bold"
          >
            {STATUSES.map((s) => (
              <option key={s || "all"} value={s}>
                {s || "(todos)"}
              </option>
            ))}
          </select>
        </label>
        <input type="hidden" name="page" value="1" />
        <button type="submit" className="btn btn-lg btn-primary shrink-0 self-end">
          Filtrar
        </button>
      </form>

      {err ? (
        <div role="alert" className="text-sm text-danger-foreground font-semibold bg-danger/10 p-4 rounded-xl border border-danger-outline/40 backdrop-blur-md flex items-start gap-2.5">
          <svg className="h-5 w-5 text-danger-emphasis shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{err}</span>
        </div>
      ) : null}

      {data ? (
        <>
          <p className="text-xs font-bold text-fg-subtle uppercase tracking-wider px-1">
            {total} trabajos en cola · Página {page} de {totalPages}
          </p>

          {/* Mobile Card Layout */}
          <div className="space-y-3.5 md:hidden">
            {data.jobs.map((j) => {
              const statusClass =
                j.status === "SUCCEEDED"
                  ? "badge-success"
                  : j.status === "FAILED" || j.status === "DEAD"
                  ? "badge-danger"
                  : j.status === "PROCESSING"
                  ? "badge-warning"
                  : "badge-neutral";

              return (
                <article key={j.id} className="panel-premium rounded-2xl p-5 border border-outline-soft/80 bg-surface/50 backdrop-blur-sm">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="font-mono text-xs font-extrabold text-fg truncate max-w-[170px]" title={j.id}>
                      ID: {j.id.slice(0, 8)}…
                    </span>
                    <span className={`badge ${statusClass}`}>
                      {j.status}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs font-sans font-medium text-fg-muted">
                    <p className="flex justify-between">
                      <span>Obligado / Tenant:</span>
                      <code className="text-fg font-bold font-mono truncate max-w-[170px]">{j.tenant_id}</code>
                    </p>
                    <p className="flex justify-between">
                      <span>Tipo de Job:</span>
                      <strong className="text-fg font-black">{j.type}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span>Intentos:</span>
                      <span className="text-fg-subtle font-mono">{j.attempts} / {j.max_attempts}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Actualizado:</span>
                      <span className="text-fg-subtle">{j.updated_at}</span>
                    </p>
                  </div>
                  <div className="mt-4 pt-3.5 border-t border-outline-soft/40 flex justify-end">
                    <Link
                      href={`/admin/jobs/${encodeURIComponent(j.id)}`}
                      className="btn btn-sm btn-secondary"
                    >
                      Detalle de envío →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden rounded-2xl border border-outline-soft/80 bg-surface/50 backdrop-blur-md shadow-sm overflow-hidden md:block">
            <table className="w-full text-left text-sm font-sans">
              <thead>
                <tr className="border-b border-outline-soft/80 bg-surface-muted/65 text-fg-subtle">
                  <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">Job ID</th>
                  <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">Tenant</th>
                  <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">Tipo de Job</th>
                  <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">Estado</th>
                  <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">Intentos</th>
                  <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">Última actualización</th>
                  <th scope="col" className="px-4 py-3 w-32 text-right">Detalles</th>
                </tr>
              </thead>
              <tbody>
                {data.jobs.map((j) => {
                  const statusClass =
                    j.status === "SUCCEEDED"
                      ? "badge-success"
                      : j.status === "FAILED" || j.status === "DEAD"
                      ? "badge-danger"
                      : j.status === "PROCESSING"
                      ? "badge-warning"
                      : "badge-neutral";

                  return (
                    <tr key={j.id} className="border-b border-outline-soft/50 last:border-0 hover:bg-surface/65 transition-colors font-medium">
                      <td className="px-4 py-3.5 font-mono text-xs text-fg-subtle" title={j.id}>
                        {j.id.slice(0, 8)}…
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-fg-muted max-w-[140px] truncate" title={j.tenant_id}>
                        <Link href={`/admin/tenants/${encodeURIComponent(j.tenant_id)}`} className="text-fg-muted hover:text-accent font-bold">
                          {j.tenant_id}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-fg">{j.type}</td>
                      <td className="px-4 py-3.5">
                        <span className={`badge ${statusClass}`}>
                          {j.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-fg-muted">
                        {j.attempts} / {j.max_attempts}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-fg-subtle whitespace-nowrap">{j.updated_at}</td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/admin/jobs/${encodeURIComponent(j.id)}`}
                          className="btn btn-sm btn-secondary"
                        >
                          Detalle
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between gap-4 pt-3.5">
            <span className="text-xs text-fg-subtle font-sans font-medium">
              Mostrando {data.jobs.length} de {total} registros
            </span>
            <div className="inline-flex gap-2">
              {page > 1 ? (
                <Link
                  href={hrefForPage(page - 1)}
                  className="btn btn-sm btn-secondary"
                >
                  ← Anterior
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="btn btn-sm btn-secondary"
                >
                  ← Anterior
                </button>
              )}
              {page < totalPages ? (
                <Link
                  href={hrefForPage(page + 1)}
                  className="btn btn-sm btn-secondary"
                >
                  Siguiente →
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="btn btn-sm btn-secondary"
                >
                  Siguiente →
                </button>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
