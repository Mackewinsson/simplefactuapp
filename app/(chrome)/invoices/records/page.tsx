import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { fetchInvoiceRecords } from "@/lib/simplefactu/invoice-records";
import { formatVerifactuActionError } from "@/lib/simplefactu/api-errors";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;
const dateFormat = new Intl.DateTimeFormat("es", {
  dateStyle: "short",
  timeStyle: "short",
});

function buildHref(params: {
  from?: string;
  to?: string;
  serie?: string;
  tipo?: string;
  page?: number;
}): string {
  const qs = new URLSearchParams();
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  if (params.serie) qs.set("serie", params.serie);
  if (params.tipo) qs.set("tipo", params.tipo);
  if (params.page && params.page > 1) qs.set("page", String(params.page));
  const s = qs.toString();
  return `/invoices/records${s ? `?${s}` : ""}`;
}

function tipoBadge(tipo: string) {
  return tipo === "ANULACION"
    ? "bg-warning-muted text-warning-foreground"
    : "bg-success-muted text-success-emphasis";
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
          <Link href="/invoices" className="text-sm text-fg-muted hover:text-fg">
            ← Facturas
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">Registro AEAT (ledger)</h1>
          <p className="mt-1 max-w-2xl text-sm text-fg-muted">
            Facturas y anulaciones aceptadas por AEAT (Correcto o ParcialmenteCorrecto). Es el histórico
            inmutable del SIF — no se puede editar ni borrar desde aquí.
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="w-full rounded bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary-hover sm:w-auto"
        >
          Nueva factura
        </Link>
      </div>

      <form
        method="get"
        className="mb-4 flex flex-wrap items-end gap-3 rounded border border-outline-soft bg-surface p-3 text-sm"
      >
        <input type="hidden" name="page" value="1" />
        <label className="block w-full sm:w-auto">
          <span className="text-fg-muted">Serie</span>
          <input
            name="serie"
            type="text"
            defaultValue={serie ?? ""}
            placeholder="2026"
            className="mt-1 block w-full rounded border border-outline px-2 py-1 text-sm sm:w-24"
          />
        </label>
        <label className="block w-full sm:w-auto">
          <span className="text-fg-muted">Tipo</span>
          <select
            name="tipo"
            defaultValue={tipo ?? ""}
            className="mt-1 block w-full rounded border border-outline px-2 py-1 text-sm sm:w-36"
          >
            <option value="">Todos</option>
            <option value="ALTA">Alta</option>
            <option value="ANULACION">Anulación</option>
          </select>
        </label>
        <label className="block w-full sm:w-auto">
          <span className="text-fg-muted">Desde</span>
          <input
            name="from"
            type="date"
            defaultValue={from ?? ""}
            className="mt-1 block w-full rounded border border-outline px-2 py-1 text-sm"
          />
        </label>
        <label className="block w-full sm:w-auto">
          <span className="text-fg-muted">Hasta</span>
          <input
            name="to"
            type="date"
            defaultValue={to ?? ""}
            className="mt-1 block w-full rounded border border-outline px-2 py-1 text-sm"
          />
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary-hover"
          >
            Filtrar
          </button>
          {hasFilters ? (
            <Link
              href="/invoices/records"
              className="rounded border border-outline px-3 py-1.5 text-sm text-fg-muted hover:bg-surface-hover"
            >
              Limpiar
            </Link>
          ) : null}
        </div>
      </form>

      {loadError ? (
        <div className="rounded border border-danger-outline bg-danger p-4 text-sm text-danger-foreground">
          {loadError}
        </div>
      ) : null}

      {!loadError && data && data.rows.length === 0 ? (
        <p className="text-sm text-fg-muted">
          No hay registros AEAT con estos filtros. Los aparecen cuando una factura se acepta en Verifactu.
        </p>
      ) : null}

      {!loadError && data && data.rows.length > 0 ? (
        <>
          <p className="mb-2 text-xs text-fg-subtle">
            {total} registro{total === 1 ? "" : "s"} · página {page} de {totalPages}
          </p>
          <div className="overflow-x-auto rounded border border-outline-soft bg-surface">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-outline-soft bg-surface-hover">
                  <th className="px-3 py-2 font-medium">Número</th>
                  <th className="px-3 py-2 font-medium">Fecha</th>
                  <th className="px-3 py-2 font-medium">Tipo</th>
                  <th className="px-3 py-2 font-medium">Estado</th>
                  <th className="px-3 py-2 font-medium">CSV</th>
                  <th className="px-3 py-2 font-medium">Registrado</th>
                  <th className="px-3 py-2 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r) => (
                  <tr key={r.id} className="border-b border-outline-soft last:border-0">
                    <td className="px-3 py-2 font-medium text-fg">{r.numSerie}</td>
                    <td className="px-3 py-2 text-fg-muted">{r.fecha}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${tipoBadge(r.tipo)}`}
                      >
                        {r.tipo}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-fg-muted">{r.estado}</td>
                    <td className="px-3 py-2 font-mono text-xs text-fg-muted">{r.csv ?? "—"}</td>
                    <td className="px-3 py-2 text-fg-muted">
                      {dateFormat.format(new Date(r.createdAt))}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/invoices/records/${r.id}`}
                        className="text-accent hover:underline"
                      >
                        Ver
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
                  className="rounded border border-outline px-3 py-1 hover:bg-surface-hover"
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
                  className="rounded border border-outline px-3 py-1 hover:bg-surface-hover"
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
