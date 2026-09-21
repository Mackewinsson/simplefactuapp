import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

const TYPE_LABEL: Record<string, string> = {
  autonomo: "Autónomo",
  empresa: "Empresa / API",
};

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) notFound();

  const typeLabel = TYPE_LABEL[lead.type] ?? lead.type;
  const message = lead.message?.trim() ?? "";

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/leads" className="text-sm text-accent hover:underline">
          ← Leads
        </Link>
        <h1 className="mt-2 text-lg font-semibold text-fg">{lead.name}</h1>
        <p className="mt-1 text-sm text-fg-subtle">
          {new Date(lead.createdAt).toLocaleString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-xl border border-outline-soft bg-surface p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">Email</dt>
          <dd className="mt-1">
            <a href={`mailto:${lead.email}`} className="text-accent hover:underline">
              {lead.email}
            </a>
          </dd>
        </div>
        <div className="rounded-xl border border-outline-soft bg-surface p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">Perfil</dt>
          <dd className="mt-1 font-medium text-fg">{typeLabel}</dd>
        </div>
      </dl>

      <section className="rounded-xl border border-outline-soft bg-surface p-4 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">Mensaje</h2>
        {message ? (
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-fg">
            {message}
          </p>
        ) : (
          <p className="mt-3 text-sm text-fg-subtle">Sin mensaje</p>
        )}
      </section>
    </div>
  );
}
