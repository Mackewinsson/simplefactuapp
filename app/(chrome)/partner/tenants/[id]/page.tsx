import Link from "next/link";
import { requirePartner } from "@/lib/auth/partner";
import {
  getPartnerSubtenant,
  listPartnerJobs,
} from "@/lib/simplefactu/partner-server";
import { PartnerSubtenantActions } from "../../PartnerSubtenantActions";

export default async function PartnerTenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await requirePartner();
  const { id } = await params;

  let tenantErr: string | null = null;
  let tenant: Awaited<ReturnType<typeof getPartnerSubtenant>> | null = null;
  try {
    tenant = await getPartnerSubtenant(userId, id);
  } catch (e: unknown) {
    tenantErr = e instanceof Error ? e.message : "Error al cargar autónomo";
  }

  let jobs: Array<Record<string, unknown>> = [];
  if (tenant) {
    try {
      const j = await listPartnerJobs(userId, id);
      jobs = j.jobs.slice(0, 20);
    } catch {
      /* optional */
    }
  }

  if (tenantErr || !tenant) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-danger-emphasis">{tenantErr ?? "No encontrado"}</p>
        <Link href="/partner" className="text-sm text-accent hover:underline">
          Volver
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/partner" className="text-sm text-fg-muted hover:text-fg">
          ← Autónomos
        </Link>
        <h1 className="mt-2 font-mono text-xl font-semibold text-fg">{tenant.id}</h1>
        <p className="text-sm text-fg-muted">
          {tenant.name || "Sin nombre"} · NIF {tenant.allowed_nif || "—"} · {tenant.status}
          {tenant.has_certificate ? " · certificado cargado" : " · sin certificado"}
        </p>
      </div>

      <PartnerSubtenantActions childId={tenant.id} status={tenant.status} />

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-fg">Últimos jobs AEAT</h2>
        {jobs.length === 0 ? (
          <p className="text-sm text-fg-muted">Sin jobs recientes.</p>
        ) : (
          <ul className="divide-y divide-outline-soft rounded border border-outline-soft text-sm">
            {jobs.map((job) => {
              const jobId = String(job.id ?? "");
              const st = String(job.status ?? "");
              const typ = String(job.type ?? "");
              return (
                <li key={jobId} className="flex justify-between px-3 py-2 font-mono text-xs">
                  <span>{jobId.slice(0, 8)}…</span>
                  <span>
                    {typ} · {st}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
