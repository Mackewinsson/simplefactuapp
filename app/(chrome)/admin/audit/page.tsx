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
    <div className="space-y-6 font-display animate-fade-in-up">
      <div>
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-bold text-fg-subtle hover:text-fg transition-colors group mb-3">
          <span className="transform group-hover:-translate-x-0.5 transition-transform">←</span> Volver a Administración
        </Link>
        <h1 className="text-3.5xl font-black tracking-tight text-fg">Registro de Auditoría</h1>
        <p className="mt-1.5 text-sm text-fg-muted font-sans font-medium">
          Historial inmutable de las últimas {rows.length} acciones operativas ejecutadas en la plataforma.
        </p>
      </div>

      {/* Mobile Card Layout */}
      <div className="space-y-3.5 md:hidden">
        {rows.map((r) => (
          <article key={r.id} className="panel-premium rounded-2xl p-5 border border-outline-soft/80 bg-surface/50 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <span className="text-[10px] font-black text-fg-subtle uppercase tracking-wider">
                {r.createdAt.toLocaleString("es-ES")}
              </span>
              <span className="shrink-0 text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full text-accent bg-accent/10 border border-accent-outline/25 font-mono">
                {r.action}
              </span>
            </div>
            <div className="space-y-1.5 text-xs font-sans font-medium text-fg-muted">
              <p className="flex justify-between">
                <span>Operador:</span>
                <code className="text-fg font-bold font-mono">{r.userId}</code>
              </p>
              {r.target && (
                <p className="flex justify-between">
                  <span>Destino:</span>
                  <code className="text-fg font-bold font-mono truncate max-w-[180px]">{r.target}</code>
                </p>
              )}
              {r.metadata && (
                <div className="mt-3 pt-3 border-t border-outline-soft/40">
                  <p className="text-[10px] uppercase font-bold text-fg-subtle mb-1">Metadatos</p>
                  <p className="font-mono text-[10px] bg-surface-muted/65 p-2 rounded-lg border border-outline-soft/40 break-all whitespace-pre-wrap leading-relaxed text-fg">
                    {r.metadata}
                  </p>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden rounded-2xl border border-outline-soft/80 bg-surface/50 backdrop-blur-md shadow-sm overflow-hidden md:block">
        <table className="w-full text-left text-sm font-sans">
          <thead>
            <tr className="border-b border-outline-soft/80 bg-surface-muted/65 text-fg-subtle">
              <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">Fecha y Hora</th>
              <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">Usuario / Operador</th>
              <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">Acción ejecutada</th>
              <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">Target</th>
              <th scope="col" className="px-4 py-3 text-xs font-black uppercase tracking-wider">Metadatos</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-outline-soft/50 last:border-0 hover:bg-surface/65 transition-colors font-medium">
                <td className="whitespace-nowrap px-4 py-3 text-xs font-semibold text-fg-subtle">
                  {r.createdAt.toLocaleString("es-ES")}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-fg-muted max-w-[140px] truncate" title={r.userId}>
                  {r.userId}
                </td>
                <td className="px-4 py-3">
                  <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full text-accent bg-accent/10 border border-accent-outline/25 font-mono">
                    {r.action}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-fg-muted max-w-[160px] truncate" title={r.target ?? ""}>
                  {r.target ?? "—"}
                </td>
                <td className="px-4 py-3 font-mono text-[10px] text-fg-subtle max-w-[280px] truncate" title={r.metadata ?? ""}>
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
