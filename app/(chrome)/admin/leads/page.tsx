import Link from "next/link";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 25;

const TYPE_LABEL: Record<string, string> = {
  autonomo: "Autónomo",
  empresa: "Empresa / API",
};

function formatLeadDate(d: Date): string {
  return d.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string; q?: string }>;
}) {
  const { page: pageParam, type, q } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;
  const query = q?.trim() ?? "";

  const where = {
    ...(type ? { type } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" as const } },
            { email: { contains: query, mode: "insensitive" as const } },
            { message: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.lead.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const qs = `${type ? `&type=${encodeURIComponent(type)}` : ""}${query ? `&q=${encodeURIComponent(query)}` : ""}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-fg">Leads</h1>
          <p className="mt-0.5 text-sm text-fg-subtle">
            {total} {total === 1 ? "registro" : "registros"} en total
          </p>
        </div>
      </div>

      <form method="GET" className="flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={query}
          placeholder="Buscar nombre, email o mensaje…"
          className="rounded-md border border-outline px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-outline"
        />
        <select
          name="type"
          defaultValue={type ?? ""}
          className="rounded-md border border-outline px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-outline"
        >
          <option value="">Todos los perfiles</option>
          <option value="autonomo">Autónomo</option>
          <option value="empresa">Empresa / API</option>
        </select>
        <button type="submit" className="btn btn-sm btn-primary">
          Filtrar
        </button>
        {(query || type) && (
          <Link href="/admin/leads" className="btn btn-sm btn-secondary">
            Limpiar
          </Link>
        )}
      </form>

      {leads.length === 0 ? (
        <p className="text-sm text-fg-subtle">No hay leads con estos filtros.</p>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <article
              key={lead.id}
              className="rounded-xl border border-outline-soft bg-surface p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-fg">{lead.name}</h2>
                  <p className="mt-0.5 text-sm">
                    <a href={`mailto:${lead.email}`} className="text-accent hover:underline">
                      {lead.email}
                    </a>
                    <span className="mx-2 text-fg-subtle">·</span>
                    <span className="inline-flex items-center rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-fg-muted">
                      {TYPE_LABEL[lead.type] ?? lead.type}
                    </span>
                  </p>
                </div>
                <p className="text-xs text-fg-subtle">{formatLeadDate(lead.createdAt)}</p>
              </div>
              {lead.message?.trim() ? (
                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-fg">
                  {lead.message}
                </p>
              ) : (
                <p className="mt-3 text-sm text-fg-subtle">Sin mensaje</p>
              )}
              <p className="mt-3">
                <Link href={`/admin/leads/${lead.id}`} className="text-xs font-semibold text-accent hover:underline">
                  Ver mensaje completo →
                </Link>
              </p>
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center gap-2 text-sm">
          {page > 1 && (
            <Link href={`?page=${page - 1}${qs}`} className="btn btn-sm btn-secondary">
              ← Anterior
            </Link>
          )}
          <span className="text-fg-subtle">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`?page=${page + 1}${qs}`} className="btn btn-sm btn-secondary">
              Siguiente →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
