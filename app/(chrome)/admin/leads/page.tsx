import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 25;

const TYPE_LABEL: Record<string, string> = {
  autonomo: "Autónomo",
  empresa: "Empresa / API",
};

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string; q?: string }>;
}) {
  const { page: pageParam, type, q } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    ...(type ? { type } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
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

      {/* Filtros */}
      <form method="GET" className="flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar nombre o email…"
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
        <button
          type="submit"
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          Filtrar
        </button>
        {(q || type) && (
          <a
            href="/admin/leads"
            className="rounded-md border border-outline px-3 py-1.5 text-sm text-fg-muted hover:bg-surface-hover"
          >
            Limpiar
          </a>
        )}
      </form>

      {/* Tabla */}
      {leads.length === 0 ? (
        <p className="text-sm text-fg-subtle">No hay leads con estos filtros.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-outline-soft">
          <table className="w-full text-sm">
            <thead className="bg-surface-hover text-left text-xs font-medium uppercase tracking-wide text-fg-subtle">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Perfil</th>
                <th className="px-4 py-3">Mensaje</th>
                <th className="px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-soft">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-surface-hover">
                  <td className="px-4 py-3 font-medium text-fg">
                    {lead.name}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-accent hover:underline"
                    >
                      {lead.email}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-fg-muted">
                      {TYPE_LABEL[lead.type] ?? lead.type}
                    </span>
                  </td>
                  <td className="max-w-xs px-4 py-3 text-fg-muted">
                    {lead.message ? (
                      <span className="line-clamp-2">{lead.message}</span>
                    ) : (
                      <span className="text-fg-subtle">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-fg-subtle">
                    {new Date(lead.createdAt).toLocaleString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2 text-sm">
          {page > 1 && (
            <a
              href={`?page=${page - 1}${type ? `&type=${type}` : ""}${q ? `&q=${q}` : ""}`}
              className="rounded border border-outline px-3 py-1.5 hover:bg-surface-hover"
            >
              ← Anterior
            </a>
          )}
          <span className="text-fg-subtle">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <a
              href={`?page=${page + 1}${type ? `&type=${type}` : ""}${q ? `&q=${q}` : ""}`}
              className="rounded border border-outline px-3 py-1.5 hover:bg-surface-hover"
            >
              Siguiente →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
