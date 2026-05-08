import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { AeatJobStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";
import { extractSerie } from "@/lib/simplefactu/invoice-series";
import { registrationStatusBadge } from "@/lib/simplefactu/aeat-status-ui";

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

  const validStatus = status && Object.values(AeatJobStatus).includes(status as AeatJobStatus)
    ? (status as AeatJobStatus)
    : undefined;

  const where = {
    userId,
    ...(q && {
      OR: [
        { number: { contains: q, mode: "insensitive" as const } },
        { customerName: { contains: q, mode: "insensitive" as const } },
        { customerNif: { contains: q, mode: "insensitive" as const } },
      ],
    }),
    ...(validStatus && { aeatStatus: validStatus }),
    ...(from && to
      ? { issueDate: { gte: new Date(from), lte: new Date(to) } }
      : from
        ? { issueDate: { gte: new Date(from) } }
        : to
          ? { issueDate: { lte: new Date(to) } }
          : {}),
    ...(serie && { number: { startsWith: serie } }),
  };

  const [invoices, total] = await prisma.$transaction([
    prisma.invoice.findMany({
      where,
      take: PAGE_SIZE,
      skip: offset,
      orderBy: { createdAt: "desc" },
    }),
    prisma.invoice.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  type InvoiceRow = (typeof invoices)[number];

  // Build query string preserving current filters but allowing page override
  const baseQs = new URLSearchParams();
  if (q) baseQs.set("q", q);
  if (status) baseQs.set("status", status);
  if (from) baseQs.set("from", from);
  if (to) baseQs.set("to", to);
  if (serie) baseQs.set("serie", serie);

  function pageHref(p: number) {
    const qs = new URLSearchParams(baseQs);
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return `/invoices${s ? `?${s}` : ""}`;
  }

  const hasFilters = !!(q || validStatus || from || to || serie);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Facturas</h1>
        <Link
          href="/invoices/new"
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Nueva factura
        </Link>
      </div>

      {/* Filters */}
      <form
        method="get"
        className="mb-4 flex flex-wrap items-end gap-3 rounded border border-gray-200 bg-white p-3 text-sm"
      >
        <label className="block">
          <span className="text-gray-600">Buscar</span>
          <input
            name="q"
            type="search"
            defaultValue={q ?? ""}
            placeholder="número, cliente, NIF…"
            className="mt-1 block w-52 rounded border border-gray-300 px-2 py-1 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-gray-600">Estado AEAT</span>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="mt-1 block rounded border border-gray-300 px-2 py-1 text-sm"
          >
            {AEAT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-gray-600">Serie</span>
          <input
            name="serie"
            type="text"
            defaultValue={serie ?? ""}
            placeholder="2026"
            className="mt-1 block w-24 rounded border border-gray-300 px-2 py-1 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-gray-600">Desde</span>
          <input
            name="from"
            type="date"
            defaultValue={from ?? ""}
            className="mt-1 block rounded border border-gray-300 px-2 py-1 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-gray-600">Hasta</span>
          <input
            name="to"
            type="date"
            defaultValue={to ?? ""}
            className="mt-1 block rounded border border-gray-300 px-2 py-1 text-sm"
          />
        </label>

        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-800"
          >
            Filtrar
          </button>
          {hasFilters && (
            <Link
              href="/invoices"
              className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Limpiar
            </Link>
          )}
        </div>
      </form>

      {invoices.length === 0 ? (
        <div className="rounded border border-gray-200 bg-white p-8 text-center">
          <p className="mb-4 text-gray-600">
            {hasFilters ? "No hay facturas con esos filtros." : "Aún no hay facturas."}
          </p>
          {!hasFilters && (
            <Link
              href="/invoices/new"
              className="inline-block rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Crear factura
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded border border-gray-200 bg-white">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 font-medium text-gray-900">Número</th>
                  <th className="px-4 py-3 font-medium text-gray-900">Serie</th>
                  <th className="px-4 py-3 font-medium text-gray-900">Cliente</th>
                  <th className="px-4 py-3 font-medium text-gray-900">Fecha</th>
                  <th className="px-4 py-3 font-medium text-gray-900">Total</th>
                  <th className="px-4 py-3 font-medium text-gray-900">AEAT</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv: InvoiceRow) => {
                  const badge = registrationStatusBadge(inv.aeatStatus, inv.aeatCancellationStatus);
                  return (
                    <tr
                      key={inv.id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {inv.number}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-600">
                          {extractSerie(inv.number)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{inv.customerName}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {dateFormat.format(inv.issueDate)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>
                {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} de {total}
              </span>
              <div className="flex gap-1">
                {page > 1 && (
                  <Link
                    href={pageHref(page - 1)}
                    className="rounded border border-gray-300 px-2 py-1 hover:bg-gray-50"
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
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
                {page < totalPages && (
                  <Link
                    href={pageHref(page + 1)}
                    className="rounded border border-gray-300 px-2 py-1 hover:bg-gray-50"
                  >
                    Siguiente →
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
