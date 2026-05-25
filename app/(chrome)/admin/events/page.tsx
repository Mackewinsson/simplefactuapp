import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminEvents, verifyEventsChain } from "@/lib/simplefactu/admin-server";

const PAGE_SIZE = 50;

const SEVERITIES = ["", "INFO", "WARNING", "ERROR", "CRITICAL"];

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    tenantId?: string;
    type?: string;
    from?: string;
    to?: string;
    verify?: string;
  }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;
  const tenantId = sp.tenantId?.trim() || undefined;
  const type = sp.type?.trim() || undefined;
  const from = sp.from?.trim() || undefined;
  const to = sp.to?.trim() || undefined;
  const runVerify = sp.verify === "1";

  let data: Awaited<ReturnType<typeof getAdminEvents>> | null = null;
  let dataErr: string | null = null;
  try {
    data = await getAdminEvents({ tenantId, type, from, to, limit: PAGE_SIZE, offset });
  } catch (e: unknown) {
    dataErr = e instanceof Error ? e.message : "Error al cargar eventos";
  }

  let chainResult: Awaited<ReturnType<typeof verifyEventsChain>> | null = null;
  let chainErr: string | null = null;
  if (runVerify) {
    try {
      chainResult = await verifyEventsChain(tenantId);
    } catch (e: unknown) {
      chainErr = e instanceof Error ? e.message : "Error al verificar cadena";
    }
  }

  const total = data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const qs = new URLSearchParams();
  if (tenantId) qs.set("tenantId", tenantId);
  if (type) qs.set("type", type);
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);

  function hrefForPage(p: number) {
    const q = new URLSearchParams(qs);
    q.set("page", String(p));
    return `/admin/events?${q}`;
  }

  function hrefForVerify() {
    const q = new URLSearchParams(qs);
    q.set("verify", "1");
    q.set("page", "1");
    return `/admin/events?${q}`;
  }

  return (
    <div className="space-y-6 font-display animate-fade-in-up">
      <div>
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-bold text-fg-subtle hover:text-fg transition-colors group mb-3">
          <span className="transform group-hover:-translate-x-0.5 transition-transform">←</span> Volver a Administración
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3.5xl font-black tracking-tight text-fg">Eventos SIF</h1>
            <p className="mt-1.5 text-sm text-fg-muted font-sans font-medium">
              Libro de registro inmutable para la auditoría de seguridad del Sistema de Información de Facturación (Verifactu).
            </p>
          </div>
          <Link
            href={hrefForVerify()}
            className="btn btn-sm btn-secondary shrink-0 self-end"
          >
            Verificar integridad de la cadena →
          </Link>
        </div>
      </div>

      {/* Chain integrity result */}
      {runVerify && (
        <section className="panel-premium rounded-2xl p-6 border border-outline-soft bg-surface/50 backdrop-blur-sm shadow-sm space-y-4">
          <div className="border-b border-outline-soft/40 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-black text-fg uppercase tracking-wider">Resultado de la verificación</h2>
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          </div>
          {chainErr ? (
            <div role="alert" className="text-xs text-danger-foreground font-semibold bg-danger/10 p-4 rounded-xl border border-danger-outline/40 backdrop-blur-md flex items-start gap-2.5">
              <svg className="h-5 w-5 text-danger-emphasis shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{chainErr}</span>
            </div>
          ) : chainResult ? (
            <div className="space-y-4 text-sm font-sans font-medium text-fg-muted">
              <div className="flex items-center gap-3">
                <span>Estado de integridad:</span>
                <span className={`inline-flex items-center gap-1.5 text-xs font-black tracking-wider uppercase px-3 py-1 rounded-full border ${
                  chainResult.valid 
                    ? "text-success-foreground bg-success-outline/30 border-success-outline/40 shadow-sm" 
                    : "text-danger-foreground bg-danger/10 border-danger-outline/40 shadow-sm animate-pulse"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${chainResult.valid ? "bg-success-emphasis" : "bg-danger-emphasis"}`} />
                  {chainResult.valid ? "Cadena íntegra (Correcto)" : "CADENA COMPROMETIDA"}
                </span>
              </div>
              <p className="text-xs">Filas analizadas: <strong className="text-fg font-black">{chainResult.rowsChecked}</strong></p>
              {chainResult.broken && (
                <div className="rounded-xl border border-danger-outline/40 bg-danger/10 p-4 text-xs text-danger-foreground font-semibold flex items-start gap-2.5">
                  <svg className="h-5 w-5 text-danger-emphasis shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="font-extrabold">Primera anomalía detectada:</p>
                    <p className="mt-1 font-sans font-medium">ID: <code className="font-mono bg-danger/20 px-1 py-0.5 rounded">{chainResult.broken.id}</code> · Tipo: {chainResult.broken.event_type} · Registrado: {chainResult.broken.created_at}</p>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </section>
      )}

      {/* Filters Form */}
      <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-outline-soft/80 bg-surface/50 backdrop-blur-md p-4 text-xs font-display" method="get">
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-fg-subtle">Tenant ID</span>
          <input name="tenantId" type="text" defaultValue={tenantId ?? ""} placeholder="sf_user_..."
            className="input w-48 rounded-xl border-outline-soft/80 py-2 px-3 focus:border-accent-outline focus:ring-2 focus:ring-accent-outline/15 font-mono text-xs shadow-sm bg-surface/50" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-fg-subtle">Tipo de evento</span>
          <input name="type" type="text" defaultValue={type ?? ""} placeholder="CHAIN_BREAK"
            className="input w-40 rounded-xl border-outline-soft/80 py-2 px-3 focus:border-accent-outline focus:ring-2 focus:ring-accent-outline/15 font-mono text-xs shadow-sm bg-surface/50" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-fg-subtle">Desde</span>
          <input name="from" type="text" defaultValue={from ?? ""} placeholder="2026-01-01"
            className="input w-32 rounded-xl border-outline-soft/80 py-2 px-3 focus:border-accent-outline focus:ring-2 focus:ring-accent-outline/15 font-mono text-xs shadow-sm bg-surface/50" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-fg-subtle">Hasta</span>
          <input name="to" type="text" defaultValue={to ?? ""} placeholder="2026-12-31"
            className="input w-32 rounded-xl border-outline-soft/80 py-2 px-3 focus:border-accent-outline focus:ring-2 focus:ring-accent-outline/15 font-mono text-xs shadow-sm bg-surface/50" />
        </label>
        <input type="hidden" name="page" value="1" />
        <button type="submit"
          className="btn btn-lg btn-primary shrink-0 self-end">
          Filtrar
        </button>
      </form>

      {dataErr ? (
        <div role="alert" className="text-sm text-danger-foreground font-semibold bg-danger/10 p-4 rounded-xl border border-danger-outline/40 backdrop-blur-md flex items-start gap-2.5">
          <svg className="h-5 w-5 text-danger-emphasis shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{dataErr}</span>
        </div>
      ) : data ? (
        <>
          <p className="text-xs font-bold text-fg-subtle uppercase tracking-wider px-1">
            {total} eventos registrados · Página {page} de {totalPages}
          </p>

          {/* Mobile Card Layout */}
          <div className="space-y-3.5 md:hidden">
            {data.events.map((ev) => {
              const severityClass =
                ev.severity === "CRITICAL" || ev.severity === "ERROR"
                  ? "text-danger-foreground bg-danger/10 border-danger-outline/35"
                  : ev.severity === "WARNING"
                  ? "text-warning-deep bg-warning-hover border-warning-outline/40"
                  : "text-fg-muted bg-surface-muted border-outline-soft/75";

              return (
                <article key={ev.id} className="panel-premium rounded-2xl p-5 border border-outline-soft/80 bg-surface/50 backdrop-blur-sm">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="font-mono text-xs font-extrabold text-fg truncate max-w-[170px]">{ev.event_type}</span>
                    <span className={`shrink-0 text-[9px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${severityClass}`}>
                      {ev.severity}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs font-sans font-medium text-fg-muted">
                    <p className="flex justify-between">
                      <span>Obligado / Tenant:</span>
                      <code className="text-fg font-bold font-mono truncate max-w-[170px]">{ev.tenant_id ?? "sistema"}</code>
                    </p>
                    <p className="flex justify-between">
                      <span>Huella SHA:</span>
                      <code className="text-fg-subtle font-bold font-mono" title={ev.huella}>{ev.huella.slice(0, 10)}…</code>
                    </p>
                    <p className="flex justify-between">
                      <span>Registrado el:</span>
                      <span className="text-fg-subtle">{ev.created_at}</span>
                    </p>
                    {ev.payload_json && (
                      <div className="mt-3 pt-3 border-t border-outline-soft/40">
                        <p className="text-[10px] uppercase font-bold text-fg-subtle mb-1">Cuerpo del evento</p>
                        <p className="font-mono text-[10px] bg-surface-muted/65 p-2 rounded-lg border border-outline-soft/40 break-all whitespace-pre-wrap leading-relaxed text-fg-muted">
                          {ev.payload_json.slice(0, 200)}…
                        </p>
                      </div>
                    )}
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
                  <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">Tipo</th>
                  <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">Severidad</th>
                  <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">Tenant / Sistema</th>
                  <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">Cuerpo Payload</th>
                  <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">Huella Hash</th>
                  <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">Fecha de registro</th>
                </tr>
              </thead>
              <tbody>
                {data.events.map((ev) => {
                  const severityClass =
                    ev.severity === "CRITICAL" || ev.severity === "ERROR"
                      ? "text-danger-foreground bg-danger/10 border-danger-outline/35"
                      : ev.severity === "WARNING"
                      ? "text-warning-deep bg-warning-hover border-warning-outline/40"
                      : "text-fg-muted bg-surface-muted border-outline-soft/75";

                  return (
                    <tr key={ev.id} className="border-b border-outline-soft/50 last:border-0 hover:bg-surface/65 transition-colors font-medium">
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-fg leading-snug">{ev.event_type}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full border ${severityClass}`}>
                          {ev.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-fg-muted max-w-[120px] truncate" title={ev.tenant_id ?? undefined}>
                        {ev.tenant_id ?? <span className="text-fg-subtle font-sans font-semibold">sistema</span>}
                      </td>
                      <td className="px-4 py-3.5 text-fg-subtle text-xs max-w-[200px] truncate" title={ev.payload_json ?? undefined}>
                        {ev.payload_json ? ev.payload_json : "—"}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-fg-subtle max-w-[90px] truncate" title={ev.huella}>
                        {ev.huella.slice(0, 10)}…
                      </td>
                      <td className="px-4 py-3.5 text-xs text-fg-subtle whitespace-nowrap">{ev.created_at}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between gap-4 pt-3.5">
            <span className="text-xs text-fg-subtle font-sans font-medium">
              Mostrando {data.events.length} de {total} registros
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
