import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { AeatJobStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";
import { extractSerie } from "@/lib/simplefactu/invoice-series";
import { registrationStatusBadge } from "@/lib/simplefactu/aeat-status-ui";
import { InvoiceViewTabs, type InvoiceVista } from "./InvoiceViewTabs";

const PAGE_SIZE = 50;
const dateFormat = new Intl.DateTimeFormat("es", { dateStyle: "short" });

export const dynamic = "force-dynamic";

const AEAT_STATUSES: { value: string; label: string }[] = [
  { value: "", label: "Todos los estados" },
  { value: "NOT_SENT", label: "No enviada" },
  { value: "PENDING", label: "Pendiente" },
  { value: "SUCCEEDED", label: "Aceptada" },
  { value: "FAILED", label: "Fallida" },
  { value: "DEAD", label: "Muerta" },
];

/** Estados mostrados en la vista Verifactu (excluye «no enviada»). */
const AEAT_STATUSES_VERIFACTU = AEAT_STATUSES.filter((s) => s.value !== "NOT_SENT");

function buildListHref(params: {
  vista: InvoiceVista;
  q?: string;
  from?: string;
  to?: string;
  serie?: string;
  status?: string;
}): string {
  const qs = new URLSearchParams();
  if (params.vista === "sin-enviar") qs.set("vista", "sin-enviar");
  if (params.q) qs.set("q", params.q);
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  if (params.serie) qs.set("serie", params.serie);
  if (params.vista === "verifactu" && params.status) qs.set("status", params.status);
  const s = qs.toString();
  return `/invoices${s ? `?${s}` : ""}`;
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    from?: string;
    to?: string;
    serie?: string;
    page?: string;
    vista?: string;
  }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const status = sp.status?.trim() || undefined;
  const from = sp.from?.trim() || undefined;
  const to = sp.to?.trim() || undefined;
  const serie = sp.serie?.trim() || undefined;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const vista: InvoiceVista = sp.vista === "sin-enviar" ? "sin-enviar" : "verifactu";

  const validStatusRaw =
    status && Object.values(AeatJobStatus).includes(status as AeatJobStatus)
      ? (status as AeatJobStatus)
      : undefined;

  const validStatusVerifactu =
    vista === "verifactu" && validStatusRaw && validStatusRaw !== AeatJobStatus.NOT_SENT
      ? validStatusRaw
      : undefined;

  const aeatWhere =
    vista === "sin-enviar"
      ? { aeatStatus: AeatJobStatus.NOT_SENT }
      : validStatusVerifactu
        ? { aeatStatus: validStatusVerifactu }
        : { aeatStatus: { not: AeatJobStatus.NOT_SENT } };

  const where = {
    userId,
    ...aeatWhere,
    ...(q && {
      OR: [
        { number: { contains: q, mode: "insensitive" as const } },
        { customerName: { contains: q, mode: "insensitive" as const } },
        { customerNif: { contains: q, mode: "insensitive" as const } },
      ],
    }),
    ...(from && to
      ? { issueDate: { gte: new Date(from), lte: new Date(to) } }
      : from
        ? { issueDate: { gte: new Date(from) } }
        : to
          ? { issueDate: { lte: new Date(to) } }
          : {}),
    ...(serie && { number: { startsWith: serie } }),
  };

  const [invoices, total, sinEnviarCount, verifactuCount] = await prisma.$transaction([
    prisma.invoice.findMany({
      where,
      take: PAGE_SIZE,
      skip: offset,
      orderBy: { createdAt: "desc" },
    }),
    prisma.invoice.count({ where }),
    prisma.invoice.count({
      where: { userId, aeatStatus: AeatJobStatus.NOT_SENT },
    }),
    prisma.invoice.count({
      where: { userId, aeatStatus: { not: AeatJobStatus.NOT_SENT } },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  type InvoiceRow = (typeof invoices)[number];

  const statusForVerifactuHref =
    vista === "verifactu" && validStatusVerifactu ? String(validStatusVerifactu) : undefined;

  const hrefVerifactu = buildListHref({
    vista: "verifactu",
    q,
    from,
    to,
    serie,
    status: statusForVerifactuHref,
  });

  const hrefSinEnviar = buildListHref({
    vista: "sin-enviar",
    q,
    from,
    to,
    serie,
  });

  const baseQs = new URLSearchParams();
  if (vista === "sin-enviar") baseQs.set("vista", "sin-enviar");
  if (q) baseQs.set("q", q);
  if (vista === "verifactu" && validStatusVerifactu) baseQs.set("status", String(validStatusVerifactu));
  if (from) baseQs.set("from", from);
  if (to) baseQs.set("to", to);
  if (serie) baseQs.set("serie", serie);

  function pageHref(p: number) {
    const qs = new URLSearchParams(baseQs);
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return `/invoices${s ? `?${s}` : ""}`;
  }

  const hasFilters = !!(
    q ||
    (vista === "verifactu" && validStatusVerifactu) ||
    from ||
    to ||
    serie
  );

  const statusSelectDefault =
    vista === "verifactu" && validStatusRaw === AeatJobStatus.NOT_SENT
      ? ""
      : (status ?? "");

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Facturas</h1>
        <Link
          href="/invoices/new"
          className="w-full rounded bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary-hover sm:w-auto"
        >
          Nueva factura
        </Link>
      </div>

      <InvoiceViewTabs
        current={vista}
        sinEnviarCount={sinEnviarCount}
        verifactuCount={verifactuCount}
        hrefVerifactu={hrefVerifactu}
        hrefSinEnviar={hrefSinEnviar}
      />

      {/* Filters */}
      <form
        method="get"
        className="mb-4 flex flex-wrap items-end gap-3 rounded border border-outline-soft bg-surface p-3 text-sm"
      >
        <input type="hidden" name="page" value="1" />
        <input type="hidden" name="vista" value={vista} />
        <label className="block w-full sm:w-auto">
          <span className="text-fg-muted">Buscar</span>
          <input
            name="q"
            type="search"
            defaultValue={q ?? ""}
            placeholder="número, cliente, NIF…"
            className="mt-1 block w-full min-w-0 rounded border border-outline px-2 py-1 text-sm sm:w-52"
          />
        </label>

        {vista === "verifactu" ? (
          <label className="block w-full sm:w-auto">
            <span className="text-fg-muted">Estado Veri*Factu</span>
            <select
              name="status"
              defaultValue={statusSelectDefault}
              className="mt-1 block w-full rounded border border-outline px-2 py-1 text-sm sm:w-auto"
            >
              {AEAT_STATUSES_VERIFACTU.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

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
          <span className="text-fg-muted">Desde</span>
          <input
            name="from"
            type="date"
            defaultValue={from ?? ""}
            className="mt-1 block w-full rounded border border-outline px-2 py-1 text-sm sm:w-auto"
          />
        </label>

        <label className="block w-full sm:w-auto">
          <span className="text-fg-muted">Hasta</span>
          <input
            name="to"
            type="date"
            defaultValue={to ?? ""}
            className="mt-1 block w-full rounded border border-outline px-2 py-1 text-sm sm:w-auto"
          />
        </label>

        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <button
            type="submit"
            className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary-hover"
          >
            Filtrar
          </button>
          {hasFilters && (
            <Link
              href="/invoices"
              className="rounded border border-outline px-3 py-1.5 text-sm text-fg-muted hover:bg-surface-hover"
            >
              Limpiar
            </Link>
          )}
        </div>
      </form>

      {invoices.length === 0 ? (
        <div className="rounded border border-outline-soft bg-surface p-8 text-center">
          {vista === "sin-enviar" ? (
            <>
              <p className="mb-2 text-fg">
                {hasFilters ? "No hay facturas por enviar con esos filtros." : "No tienes facturas pendientes de envío."}
              </p>
              <p className="mb-4 text-sm text-fg-muted">
                Las facturas nuevas aparecen aquí hasta que las envíes a Verifactu desde el detalle.
              </p>
              <Link
                href="/invoices/new"
                className="inline-block rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
              >
                Nueva factura
              </Link>
            </>
          ) : (
            <>
              <p className="mb-2 text-fg">
                {hasFilters
                  ? "No hay facturas en Verifactu con esos filtros."
                  : "Aún no hay envíos a Verifactu."}
              </p>
              {!hasFilters && verifactuCount === 0 && sinEnviarCount > 0 ? (
                <p className="mb-4 text-sm text-fg-muted">
                  Tienes facturas listas para enviar. Abre una, revisa los datos y pulsa «Enviar a Verifactu».
                </p>
              ) : !hasFilters ? (
                <p className="mb-4 text-sm text-fg-muted">
                  Cuando envíes una factura a Verifactu, el estado aparecerá aquí.
                </p>
              ) : null}
              {!hasFilters && verifactuCount === 0 && sinEnviarCount > 0 ? (
                <Link
                  href={hrefSinEnviar}
                  className="inline-block rounded border border-outline bg-surface px-4 py-2 text-sm font-medium text-fg hover:bg-surface-hover"
                >
                  Ver facturas por enviar ({sinEnviarCount})
                </Link>
              ) : !hasFilters && sinEnviarCount === 0 && verifactuCount === 0 ? (
                <Link
                  href="/invoices/new"
                  className="inline-block rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
                >
                  Crear factura
                </Link>
              ) : null}
            </>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {invoices.map((inv: InvoiceRow) => {
              const badge = registrationStatusBadge(inv.aeatStatus, inv.aeatCancellationStatus);
              return (
                <article key={inv.id} className="rounded border border-outline-soft bg-surface p-3">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/invoices/${inv.id}`} className="font-medium text-accent hover:underline">
                      {inv.number}
                    </Link>
                    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-fg-muted">{inv.customerName}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-fg-muted">
                    <span>{dateFormat.format(inv.issueDate)}</span>
                    <span className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-xs text-fg-muted">
                      {extractSerie(inv.number)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-fg">
                    {formatCents(inv.currency, inv.totalCents)}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto rounded border border-outline-soft bg-surface md:block">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-outline-soft bg-surface-hover">
                  <th className="px-4 py-3 font-medium text-fg">Número</th>
                  <th className="px-4 py-3 font-medium text-fg">Serie</th>
                  <th className="px-4 py-3 font-medium text-fg">Cliente</th>
                  <th className="px-4 py-3 font-medium text-fg">Fecha</th>
                  <th className="px-4 py-3 font-medium text-fg">Total</th>
                  <th className="px-4 py-3 font-medium text-fg">Veri*Factu</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv: InvoiceRow) => {
                  const badge = registrationStatusBadge(inv.aeatStatus, inv.aeatCancellationStatus);
                  return (
                    <tr
                      key={inv.id}
                      className="border-b border-outline-soft last:border-0 hover:bg-surface-hover"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="font-medium text-accent hover:underline"
                        >
                          {inv.number}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-xs text-fg-muted">
                          {extractSerie(inv.number)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-fg-muted">{inv.customerName}</td>
                      <td className="px-4 py-3 text-fg-muted">
                        {dateFormat.format(inv.issueDate)}
                      </td>
                      <td className="px-4 py-3 text-fg-muted">
                        {formatCents(inv.currency, inv.totalCents)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded px-1.5 py-0.5 text-xs font-medium ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col gap-2 text-sm text-fg-muted sm:flex-row sm:items-center sm:justify-between">
            <span>
              {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} de {total}
            </span>
            {totalPages > 1 ? (
              <div className="flex flex-wrap gap-1">
                {page > 1 && (
                  <Link
                    href={pageHref(page - 1)}
                    className="rounded border border-outline px-2 py-1 hover:bg-surface-hover"
                  >
                    ← Anterior
                  </Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - page) <= 2)
                  .map((p) => (
                    <Link
                      key={p}
                      href={pageHref(p)}
                      className={`rounded border px-2 py-1 ${
                        p === page
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-outline hover:bg-surface-hover"
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
                {page < totalPages && (
                  <Link
                    href={pageHref(page + 1)}
                    className="rounded border border-outline px-2 py-1 hover:bg-surface-hover"
                  >
                    Siguiente →
                  </Link>
                )}
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
