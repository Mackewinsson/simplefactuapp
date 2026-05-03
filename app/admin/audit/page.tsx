import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";

export default async function AdminAuditPage() {
  await requireAdmin();

  const rows = await prisma.adminActionLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-4">
      <Link href="/admin" className="text-sm text-blue-600 hover:underline">
        ← Inicio
      </Link>
      <h1 className="text-xl font-semibold text-gray-900">Auditoría admin</h1>
      <p className="text-sm text-gray-600">
        Últimas {rows.length} acciones registradas desde el panel (Postgres).
      </p>
      <div className="overflow-x-auto rounded border border-gray-200 bg-white">
        <table className="min-w-full text-left text-xs">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-2 py-2">Fecha</th>
              <th className="px-2 py-2">Usuario</th>
              <th className="px-2 py-2">Acción</th>
              <th className="px-2 py-2">Target</th>
              <th className="px-2 py-2">Metadatos</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-gray-100">
                <td className="whitespace-nowrap px-2 py-2">{r.createdAt.toISOString()}</td>
                <td className="max-w-[120px] truncate px-2 py-2 font-mono" title={r.userId}>
                  {r.userId}
                </td>
                <td className="px-2 py-2">{r.action}</td>
                <td className="max-w-[160px] truncate px-2 py-2 font-mono" title={r.target ?? ""}>
                  {r.target ?? "—"}
                </td>
                <td className="max-w-[240px] truncate px-2 py-2" title={r.metadata ?? ""}>
                  {r.metadata ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
