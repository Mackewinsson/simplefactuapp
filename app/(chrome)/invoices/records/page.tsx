import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { fetchInvoiceRecords } from "@/lib/simplefactu/invoice-records";
import { formatVerifactuActionError } from "@/lib/simplefactu/api-errors";
import {
  invoiceRecordEstadoBadgeVariant,
  invoiceRecordEstadoLabel,
  invoiceRecordTipoBadgeVariant,
  invoiceRecordTipoLabel,
} from "@/lib/simplefactu/invoice-record-labels";
import { statusBadgeClass } from "@/lib/ui/status-badge";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;
const dateFormat = new Intl.DateTimeFormat("es", {
  dateStyle: "short",
  timeStyle: "short",
});

function buildQueryParams(params: {
  from?: string;
  to?: string;
  serie?: string;
  tipo?: string;
  page?: number;
}): URLSearchParams {
  const qs = new URLSearchParams();
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  if (params.serie) qs.set("serie", params.serie);
  if (params.tipo) qs.set("tipo", params.tipo);
  if (params.page && params.page > 1) qs.set("page", String(params.page));
  return qs;
}

function buildHref(params: {
  from?: string;
  to?: string;
  serie?: string;
  tipo?: string;
  page?: number;
}): string {
  const s = buildQueryParams(params).toString();
  return `/invoices/records${s ? `?${s}` : ""}`;
}

function buildExportHref(params: {
  from?: string;
  to?: string;
  serie?: string;
  tipo?: string;
}): string {
  const s = buildQueryParams(params).toString();
  return `/invoices/records/export${s ? `?${s}` : ""}`;
}

export default async function InvoiceRecordsPage({
  searchParams,
}: {
  searchParams: Promise<{
    from?: string;
    to?: string;
    serie?: string;
    tipo?: string;
    page?: string;
  }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const sp = await searchParams;
  const from = sp.from?.trim() || undefined;
  const to = sp.to?.trim() || undefined;
  const serie = sp.serie?.trim() || undefined;
  const tipo =
    sp.tipo === "ALTA" || sp.tipo === "ANULACION" ? sp.tipo : undefined;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  let data: Awaited<ReturnType<typeof fetchInvoiceRecords>> | null = null;
  let loadError: string | null = null;

  try {
    data = await fetchInvoiceRecords(userId, {
      from,
      to,
      serie,
      tipo,
      limit: PAGE_SIZE,
      offset,
    });
  } catch (e) {
    loadError = formatVerifactuActionError(e);
  }

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = Boolean(from || to || serie || tipo);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/invoices" className="text-sm text-fg-muted hover:text-fg transition-colors">
            ← Facturas
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-fg tracking-tight">Histórico en Hacienda</h1>
          <p className="mt-1 max-w-2xl text-sm text-fg-muted">
            Facturas y anulaciones que Hacienda ha aceptado. Puedes consultarlas aquí o exportarlas
            en CSV para tu gestoría. Es solo consulta: no se puede editar ni borrar.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row items-center">
          {!loadError && data && data.total > 0 ? (
            <a
              href={buildExportHref({ from, to, serie, tipo })}
              className="btn btn-sm btn-secondary text-center w-full sm:w-auto"
            >
              Exportar CSV
            </a>
          ) : null}
          <Link
            href="/invoices/new"
            className="btn btn-sm btn-accent text-center w-full sm:w-auto"
          >
            Nueva factura
          </Link>
        </div>
      </div>

      <form
        method="get"
        className="mb-6 flex flex-wrap items-end gap-4 rounded-2xl border border-outline-soft/80 bg-surface/50 backdrop-blur-md p-5 text-sm shadow-sm"
      >
        <input type="hidden" name="page" value="1" />
        <label className="block w-full sm:w-auto">
          <span className="text-fg-subtle font-bold text-xs uppercase tracking-wider">Serie</span>
          <input
            name="serie"
            type="text"
            defaultValue={serie ?? ""}
            placeholder="2026"
            className="input mt-1.5 block w-full rounded-xl border-outline-soft/80 py-2 px-3 focus:border-accent-outline focus:ring-2 focus:ring-accent-outline/20 transition-all font-sans font-medium text-fg shadow-sm bg-surface/50 sm:w-28 text-xs"
          />
        </label>
        <label className="block w-full sm:w-auto">
          <span className="text-fg-subtle font-bold text-xs uppercase tracking-wider">Operación</span>
          <select
            name="tipo"
            defaultValue={tipo ?? ""}
            className="input mt-1.5 block w-full rounded-xl border-outline-soft/80 py-2 px-3 focus:border-accent-outline focus:ring-2 focus:ring-accent-outline/20 transition-all font-sans font-medium text-fg shadow-sm bg-surface/50 sm:w-36 text-xs"
          >
            <option value="">Todas</option>
            <option value="ALTA">Facturas</option>
            <option value="ANULACION">Anulaciones</option>
          </select>
        </label>
        <label className="block w-full sm:w-auto">
          <span className="text-fg-subtle font-bold text-xs uppercase tracking-wider">Desde</span>
          <input
            name="from"
            type="date"
            defaultValue={from ?? ""}
            className="input mt-1.5 block w-full rounded-xl border-outline-soft/80 py-2 px-3 focus:border-accent-outline focus:ring-2 focus:ring-accent-outline/20 transition-all font-sans font-medium text-fg shadow-sm bg-surface/50 text-xs"
          />
        </label>
        <label className="block w-full sm:w-auto">
          <span className="text-fg-subtle font-bold text-xs uppercase tracking-wider">Hasta</span>
          <input
            name="to"
            type="date"
            defaultValue={to ?? ""}
            className="input mt-1.5 block w-full rounded-xl border-outline-soft/80 py-2 px-3 focus:border-accent-outline focus:ring-2 focus:ring-accent-outline/20 transition-all font-sans font-medium text-fg shadow-sm bg-surface/50 text-xs"
          />
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            className="btn btn-sm btn-primary"
          >
            Filtrar
          </button>
          {hasFilters ? (
            <Link
              href="/invoices/records"
              className="btn btn-sm btn-secondary"
            >
              Limpiar
            </Link>
          ) : null}
        </div>
      </form>

      {loadError ? (
        <div className="rounded-xl border border-danger-outline bg-danger p-4 text-sm text-danger-foreground">
          {loadError}
        </div>
      ) : null}

      {!loadError && data && data.rows.length === 0 ? (
        <p className="text-sm text-fg-muted">
          Aún no hay facturas registradas en Hacienda con estos filtros. Aparecerán aquí cuando
          envíes una factura a Verifactu y Hacienda la acepte.
        </p>
      ) : null}

      {!loadError && data && data.rows.length > 0 ? (
        <>
          <p className="mb-2 text-xs text-fg-subtle font-semibold">
            {total} factura{total === 1 ? "" : "s"} · página {page} de {totalPages}
          </p>
          <div className="overflow-x-auto rounded-2xl border border-outline-soft/80 bg-surface/50 backdrop-blur-md shadow-sm overflow-hidden">
            <table className="w-full min-w-[720px] text-left text-sm font-sans">
              <thead className="border-b border-outline-soft/80 bg-surface-muted/65 text-fg-subtle">
                <tr>
                  <th scope="col" className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-fg-subtle">Número</th>
                  <th scope="col" className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-fg-subtle">Fecha</th>
                  <th scope="col" className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-fg-subtle">Operación</th>
                  <th scope="col" className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-fg-subtle">Estado</th>
                  <th scope="col" className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-fg-subtle">CSV</th>
                  <th scope="col" className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-fg-subtle">Enviado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-soft/40 font-medium">
                {data.rows.map((r) => (
                  <tr
                    key={r.id}
                    className="group hover:bg-surface-hover/80 transition-colors duration-200 cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/invoices/records/${r.id}`}
                        className="font-bold text-accent hover:underline block -mx-5 px-5 -my-4 py-4 font-mono text-[13px]"
                      >
                        {r.numSerie}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-fg-muted font-sans text-xs">
                      <Link
                        href={`/invoices/records/${r.id}`}
                        className="block -mx-5 px-5 -my-4 py-4"
                      >
                        {r.fecha}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/invoices/records/${r.id}`}
                        className="block -mx-5 px-5 -my-4 py-4"
                      >
                        <span
                          className={statusBadgeClass(invoiceRecordTipoBadgeVariant(r.tipo))}
                        >
                          {invoiceRecordTipoLabel(r.tipo)}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/invoices/records/${r.id}`}
                        className="block -mx-5 px-5 -my-4 py-4"
                      >
                        <span
                          className={statusBadgeClass(invoiceRecordEstadoBadgeVariant(r.estado))}
                        >
                          {invoiceRecordEstadoLabel(r.estado)}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/invoices/records/${r.id}`}
                        className="block -mx-5 px-5 -my-4 py-4 font-mono text-[12px] text-fg-subtle"
                      >
                        <span className="font-mono text-[11px] font-medium text-fg-muted bg-surface-muted/80 px-2 py-0.5 rounded border border-outline-soft/40">
                          {r.csv ?? "—"}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-fg-muted font-sans text-xs">
                      <Link
                        href={`/invoices/records/${r.id}`}
                        className="block -mx-5 px-5 -my-4 py-4"
                      >
                        {dateFormat.format(new Date(r.createdAt))}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 ? (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
              {page > 1 ? (
                <Link
                  href={buildHref({ from, to, serie, tipo, page: page - 1 })}
                  className="btn btn-sm btn-secondary"
                >
                  ← Anterior
                </Link>
              ) : null}
              <span className="text-fg-muted">
                Página {page} / {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={buildHref({ from, to, serie, tipo, page: page + 1 })}
                  className="btn btn-sm btn-secondary"
                >
                  Siguiente →
                </Link>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
