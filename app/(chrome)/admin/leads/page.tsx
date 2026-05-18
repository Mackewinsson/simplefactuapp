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
          <h1 className="text-lg font-semibold text-gray-900">Leads</h1>
          <p className="mt-0.5 text-sm text-gray-500">
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
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
        <select
          name="type"
          defaultValue={type ?? ""}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
        >
          <option value="">Todos los perfiles</option>
          <option value="autonomo">Autónomo</option>
          <option value="empresa">Empresa / API</option>
        </select>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
        >
          Filtrar
        </button>
        {(q || type) && (
          <a
            href="/admin/leads"
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            Limpiar
          </a>
        )}
      </form>

      {/* Tabla */}
      {leads.length === 0 ? (
        <p className="text-sm text-gray-500">No hay leads con estos filtros.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Perfil</th>
                <th className="px-4 py-3">Mensaje</th>
                <th className="px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {lead.name}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {lead.email}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                      {TYPE_LABEL[lead.type] ?? lead.type}
                    </span>
                  </td>
                  <td className="max-w-xs px-4 py-3 text-gray-600">
                    {lead.message ? (
                      <span className="line-clamp-2">{lead.message}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-500">
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
              className="rounded border border-gray-300 px-3 py-1.5 hover:bg-gray-50"
            >
              ← Anterior
            </a>
          )}
          <span className="text-gray-500">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <a
              href={`?page=${page + 1}${type ? `&type=${type}` : ""}${q ? `&q=${q}` : ""}`}
              className="rounded border border-gray-300 px-3 py-1.5 hover:bg-gray-50"
            >
              Siguiente →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
