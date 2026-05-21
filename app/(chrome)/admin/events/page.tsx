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
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-fg">Eventos SIF</h1>
          <p className="mt-0.5 text-sm text-fg-muted">
            Registro de auditoría inmutable del Sistema de Información de Facturación.
          </p>
        </div>
        <Link
          href={hrefForVerify()}
          className="rounded border border-outline-soft bg-surface px-3 py-1.5 text-sm text-accent hover:bg-surface-hover hover:underline"
        >
          Verificar integridad de cadena →
        </Link>
      </div>

      {/* Chain integrity result */}
      {runVerify && (
        <section className="rounded-lg border border-outline-soft bg-surface p-4">
          <h2 className="mb-2 text-sm font-semibold text-fg">Resultado de verificación</h2>
          {chainErr ? (
            <p className="text-sm text-danger-foreground">{chainErr}</p>
          ) : chainResult ? (
            <div className="space-y-1 text-sm">
              <p>
                Estado:{" "}
                <span className={chainResult.valid ? "font-semibold text-success-foreground" : "font-semibold text-danger-foreground"}>
                  {chainResult.valid ? "Cadena íntegra" : "CADENA COMPROMETIDA"}
                </span>
              </p>
              <p className="text-fg-muted">Filas comprobadas: {chainResult.rowsChecked}</p>
              {chainResult.broken && (
                <div className="rounded border border-danger-outline bg-danger px-3 py-2 text-danger-foreground">
                  Primera anomalía — ID: <span className="font-mono text-xs">{chainResult.broken.id}</span> —{" "}
                  {chainResult.broken.event_type} — {chainResult.broken.created_at}
                </div>
              )}
            </div>
          ) : null}
        </section>
      )}

      {/* Filters */}
      <form className="flex flex-wrap items-end gap-3 rounded border border-outline-soft bg-surface p-3 text-sm" method="get">
        <label className="block">
          <span className="text-fg-muted">Tenant ID</span>
          <input name="tenantId" type="text" defaultValue={tenantId ?? ""} placeholder="sf_user_..."
            className="mt-1 block w-48 rounded border border-outline px-2 py-1 font-mono text-xs" />
        </label>
        <label className="block">
          <span className="text-fg-muted">Tipo de evento</span>
          <input name="type" type="text" defaultValue={type ?? ""} placeholder="CHAIN_BREAK"
            className="mt-1 block w-40 rounded border border-outline px-2 py-1 font-mono text-xs" />
        </label>
        <label className="block">
          <span className="text-fg-muted">Desde</span>
          <input name="from" type="text" defaultValue={from ?? ""} placeholder="2026-01-01"
            className="mt-1 block w-32 rounded border border-outline px-2 py-1 font-mono text-xs" />
        </label>
        <label className="block">
          <span className="text-fg-muted">Hasta</span>
          <input name="to" type="text" defaultValue={to ?? ""} placeholder="2026-12-31"
            className="mt-1 block w-32 rounded border border-outline px-2 py-1 font-mono text-xs" />
        </label>
        <input type="hidden" name="page" value="1" />
        <button type="submit"
          className="rounded bg-primary-hover px-3 py-1 text-primary-foreground hover:bg-primary-hover">
          Filtrar
        </button>
      </form>

      {dataErr ? (
        <p className="text-sm text-danger-foreground">{dataErr}</p>
      ) : data ? (
        <>
          <p className="text-sm text-fg-muted">
            {total} eventos — página {page} de {totalPages}
          </p>
          <div className="overflow-x-auto rounded border border-outline-soft bg-surface">
            <table className="min-w-full text-left text-xs">
              <thead className="border-b border-outline-soft bg-surface-hover text-[10px] uppercase text-fg-subtle">
                <tr>
                  <th className="px-2 py-2">Tipo</th>
                  <th className="px-2 py-2">Severidad</th>
                  <th className="px-2 py-2">Tenant</th>
                  <th className="px-2 py-2">Payload</th>
                  <th className="px-2 py-2">Huella</th>
                  <th className="px-2 py-2">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {data.events.map((ev) => {
                  const severityClass =
                    ev.severity === "CRITICAL" || ev.severity === "ERROR"
                      ? "text-danger-foreground"
                      : ev.severity === "WARNING"
                      ? "text-warning-deeper"
                      : "text-fg-muted";
                  return (
                    <tr key={ev.id} className="border-b border-outline-soft hover:bg-surface-hover">
                      <td className="px-2 py-2 font-mono font-medium">{ev.event_type}</td>
                      <td className={`px-2 py-2 font-medium ${severityClass}`}>{ev.severity}</td>
                      <td className="max-w-[120px] truncate px-2 py-2 font-mono text-fg-muted"
                        title={ev.tenant_id ?? undefined}>
                        {ev.tenant_id ?? <span className="text-fg-subtle">sistema</span>}
                      </td>
                      <td className="max-w-[240px] truncate px-2 py-2 text-fg-muted"
                        title={ev.payload_json ?? undefined}>
                        {ev.payload_json ? ev.payload_json.slice(0, 80) : "—"}
                      </td>
                      <td className="max-w-[80px] truncate px-2 py-2 font-mono text-fg-subtle"
                        title={ev.huella}>
                        {ev.huella.slice(0, 10)}…
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 text-fg-muted">{ev.created_at}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex gap-4 text-sm">
            {page > 1 && (
              <Link href={hrefForPage(page - 1)} className="text-accent hover:underline">Anterior</Link>
            )}
            {page < totalPages && (
              <Link href={hrefForPage(page + 1)} className="text-accent hover:underline">Siguiente</Link>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
