import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import {
  getTenant,
  getTenantCertificateMeta,
  getTenantChains,
  listAdminJobs,
  getAdminEvents,
  type AdminTenant,
  type CertificateMetaResponse,
  type AdminJobRow,
  type AdminChainRow,
  type AdminEvent,
} from "@/lib/simplefactu/admin-server";
import { RetryJobForm } from "@/app/(chrome)/admin/support/RetryJobForm";
import { ImpersonateButton } from "@/components/admin/ImpersonateButton";
import {
  adminMaintenanceOffFormAction,
  adminReactivateTenantFormAction,
} from "@/app/(chrome)/admin/actions";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const q = (sp.q?.trim() ?? "").slice(0, 200);

  if (q && UUID_RE.test(q)) {
    redirect(`/admin/jobs/${encodeURIComponent(q)}`);
  }

  let tenant: AdminTenant | null = null;
  let cert: CertificateMetaResponse | null = null;
  let jobs: AdminJobRow[] = [];
  let chains: AdminChainRow[] = [];
  let chainBreakEvents: AdminEvent[] = [];
  let loadErr: string | null = null;
  let clerkUserId: string | null = null;

  if (q) {
    try {
      const res = await getTenant(q);
      tenant = res.tenant;
    } catch (e: unknown) {
      loadErr = e instanceof Error ? e.message : "No se pudo cargar el tenant";
    }

    if (tenant) {
      const [certRes, jobsRes, chainsRes, eventsRes, vf, partner] = await Promise.all([
        getTenantCertificateMeta(tenant.id).catch(() => null),
        listAdminJobs({ tenantId: tenant.id, limit: 10, offset: 0 }).catch(() => null),
        getTenantChains(tenant.id).catch(() => null),
        getAdminEvents({
          tenantId: tenant.id,
          type: "CHAIN_BREAK",
          limit: 5,
          offset: 0,
        }).catch(() => null),
        prisma.userVerifactuAccount.findFirst({
          where: { simplefactuTenantId: tenant.id },
          select: { userId: true },
        }),
        prisma.userPartnerAccount.findFirst({
          where: { partnerTenantId: tenant.id },
          select: { userId: true },
        }),
      ]);
      cert = certRes;
      jobs = jobsRes?.jobs ?? [];
      chains = chainsRes?.chains ?? [];
      chainBreakEvents = eventsRes?.events ?? [];
      clerkUserId = vf?.userId ?? partner?.userId ?? null;
    }
  }

  const maintenanceOn = Boolean(tenant?.maintenance_mode);
  const hasCert = Boolean(cert?.hasCertificate);
  const daysUntilExpiry = cert?.certificate?.daysUntilExpiry ?? null;
  const deadJobs = jobs.filter((j) => j.status === "DEAD");
  const failedJobs = jobs.filter((j) => j.status === "FAILED");

  const problems: string[] = [];
  if (tenant) {
    if (tenant.status === "SUSPENDED") problems.push("Tenant SUSPENDED — no puede enviar facturas.");
    if (maintenanceOn) problems.push("Maintenance mode activo.");
    if (!hasCert) problems.push("Sin certificado PFX subido.");
    if (daysUntilExpiry != null && daysUntilExpiry < 0) {
      problems.push(`Certificado caducado hace ${Math.abs(daysUntilExpiry)} días.`);
    } else if (daysUntilExpiry != null && daysUntilExpiry <= 30) {
      problems.push(`Certificado caduca en ${daysUntilExpiry} días.`);
    }
    if (deadJobs.length) problems.push(`${deadJobs.length} job(s) DEAD en los últimos 10.`);
    if (failedJobs.length) problems.push(`${failedJobs.length} job(s) FAILED en los últimos 10.`);
    if (chainBreakEvents.length) problems.push("Eventos CHAIN_BREAK recientes en el SIF.");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-fg">Soporte</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Busca un cliente por tenant ID (o pega un job UUID para ir directo al detalle).
        </p>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-2">
        <label className="block min-w-[16rem] flex-1 text-sm">
          <span className="text-fg-muted">Cliente / Job</span>
          <input
            name="q"
            type="search"
            defaultValue={q}
            placeholder="sf_user_… · rp_… · job UUID"
            className="mt-1 w-full rounded border border-outline px-3 py-2 font-mono text-sm"
          />
        </label>
        <button type="submit" className="btn btn-sm btn-primary">
          Abrir
        </button>
        <Link href="/admin/users" className="btn btn-sm btn-secondary">
          Buscar en Usuarios
        </Link>
      </form>

      {q && loadErr ? (
        <p className="rounded border border-danger-outline bg-danger/40 px-3 py-2 text-sm text-danger-foreground">
          {loadErr}
        </p>
      ) : null}

      {tenant ? (
        <section className="space-y-4 rounded-2xl border border-outline-soft bg-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-fg font-display">{tenant.name ?? tenant.id}</h2>
              <p className="mt-1 font-mono text-xs text-accent">{tenant.id}</p>
              {clerkUserId ? (
                <p className="mt-1 text-xs text-fg-subtle">Clerk: {clerkUserId}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/tenants/${encodeURIComponent(tenant.id)}`}
                className="btn btn-sm btn-secondary"
              >
                Ficha completa
              </Link>
              <Link
                href={`/admin/jobs?tenant_id=${encodeURIComponent(tenant.id)}`}
                className="btn btn-sm btn-secondary"
              >
                Todos los jobs
              </Link>
              <ImpersonateButton tenantId={tenant.id} tenantName={tenant.name} />
            </div>
          </div>

          <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <Info label="Estado" value={tenant.status} danger={tenant.status === "SUSPENDED"} />
            <Info label="Plan" value={tenant.plan_id} />
            <Info label="NIF permitido" value={tenant.allowed_nif ?? "—"} mono />
            <Info
              label="Maintenance"
              value={maintenanceOn ? "ON" : "off"}
              danger={maintenanceOn}
            />
            <Info
              label="Certificado"
              value={
                !hasCert
                  ? "No"
                  : daysUntilExpiry != null
                    ? `Sí · ${daysUntilExpiry}d`
                    : "Sí"
              }
              danger={!hasCert || (daysUntilExpiry != null && daysUntilExpiry <= 7)}
            />
            <Info
              label="Caducidad cert"
              value={cert?.certificate?.notAfter ?? "—"}
              mono
            />
            <Info label="Cadenas" value={String(chains.length)} />
            <Info
              label="Email notif."
              value={tenant.notification_email ?? "—"}
            />
          </dl>

          {problems.length > 0 ? (
            <div className="rounded-lg border border-warning-outline bg-warning/40 p-3">
              <h3 className="text-sm font-semibold text-warning-deep">Problemas detectados</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-warning-foreground">
                {problems.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="rounded-lg border border-success-outline/40 bg-success/20 px-3 py-2 text-sm text-success-foreground">
              Sin alertas automáticas en este resumen.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {tenant.status === "SUSPENDED" ? (
              <form action={adminReactivateTenantFormAction}>
                <input type="hidden" name="tenantId" value={tenant.id} />
                <input type="hidden" name="status" value="ACTIVE" />
                <button type="submit" className="btn btn-sm btn-primary">
                  Reactivar tenant
                </button>
              </form>
            ) : null}
            {maintenanceOn ? (
              <form action={adminMaintenanceOffFormAction}>
                <input type="hidden" name="tenantId" value={tenant.id} />
                <button type="submit" className="btn btn-sm btn-primary">
                  Salir de maintenance
                </button>
              </form>
            ) : null}
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-fg">Últimos 10 jobs</h3>
            {jobs.length === 0 ? (
              <p className="text-sm text-fg-subtle">Sin jobs.</p>
            ) : (
              <div className="overflow-x-auto rounded border border-outline-soft">
                <table className="w-full min-w-[640px] text-left text-xs">
                  <thead className="bg-surface-muted text-fg-subtle">
                    <tr>
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">Tipo</th>
                      <th className="px-3 py-2">Estado</th>
                      <th className="px-3 py-2">Error</th>
                      <th className="px-3 py-2">Actualizado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-soft/50">
                    {jobs.map((j) => (
                      <tr key={j.id}>
                        <td className="px-3 py-2 font-mono">
                          <Link
                            href={`/admin/jobs/${encodeURIComponent(j.id)}`}
                            className="text-accent hover:underline"
                          >
                            {j.id.slice(0, 8)}…
                          </Link>
                        </td>
                        <td className="px-3 py-2">{j.type}</td>
                        <td className="px-3 py-2 font-semibold">{j.status}</td>
                        <td className="max-w-[240px] truncate px-3 py-2 text-danger-foreground">
                          {j.last_error ?? "—"}
                        </td>
                        <td className="px-3 py-2 font-mono text-fg-subtle">{j.updated_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {chains.length > 0 ? (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-fg">Cadenas</h3>
              <ul className="space-y-1 text-xs font-mono text-fg-muted">
                {chains.slice(0, 5).map((c) => (
                  <li key={c.chainKey}>
                    {c.chainKey} · huella {c.lastHuella?.slice(0, 12)}…
                    {c.lastTimestamp ? ` · ${c.lastTimestamp}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-lg border border-outline-soft bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold text-fg">Reintentar job AEAT por ID</h2>
        <RetryJobForm />
      </section>
    </div>
  );
}

function Info({
  label,
  value,
  mono,
  danger,
}: {
  label: string;
  value: string;
  mono?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="rounded-lg border border-outline-soft/70 bg-surface-muted/40 px-3 py-2">
      <dt className="text-[10px] font-bold uppercase tracking-wider text-fg-subtle">{label}</dt>
      <dd
        className={`mt-0.5 break-all text-sm font-semibold ${
          danger ? "text-danger-foreground" : "text-fg"
        } ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
