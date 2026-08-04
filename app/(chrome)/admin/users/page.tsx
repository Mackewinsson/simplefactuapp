import Link from "next/link";
import { redirect } from "next/navigation";
import { clerkClient } from "@clerk/nextjs/server";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import { listTenants, getTenant, type AdminTenant } from "@/lib/simplefactu/admin-server";
import { CreateTenantForm } from "../tenants/CreateTenantForm";
import { ImpersonateButton } from "@/components/admin/ImpersonateButton";

const PAGE_SIZE = 50;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;
  const qRaw = sp.q?.trim() ?? "";
  const q = qRaw.slice(0, 200);

  // Job UUID → jump straight to job detail (support shortcut).
  if (q && UUID_RE.test(q)) {
    redirect(`/admin/jobs/${encodeURIComponent(q)}`);
  }

  let tenants: AdminTenant[] = [];
  let total = 0;
  let apiErr: string | null = null;
  let searchNote: string | null = null;

  try {
    if (q.includes("@")) {
      // Email → Clerk → Prisma tenant mapping → fetch those tenants from API.
      const resolved = await resolveTenantsByEmail(q);
      tenants = resolved.tenants;
      total = tenants.length;
      searchNote = resolved.note;
    } else if (q.startsWith("user_")) {
      const resolved = await resolveTenantsByClerkId(q);
      tenants = resolved.tenants;
      total = tenants.length;
      searchNote = resolved.note;
    } else if (q) {
      // Tenant id / NIF / name — API-side LIKE search.
      const data = await listTenants(PAGE_SIZE, offset, q);
      tenants = data.tenants;
      total = data.pagination.total;
    } else {
      const data = await listTenants(PAGE_SIZE, offset);
      tenants = data.tenants;
      total = data.pagination.total;
    }
  } catch (e: unknown) {
    apiErr = e instanceof Error ? e.message : "Error al listar usuarios";
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const tenantIds = tenants.map((t) => t.id);
  const [vfAccounts, partnerAccounts] = await Promise.all([
    tenantIds.length
      ? prisma.userVerifactuAccount.findMany({
          where: { simplefactuTenantId: { in: tenantIds } },
          select: { userId: true, simplefactuTenantId: true },
        })
      : [],
    tenantIds.length
      ? prisma.userPartnerAccount.findMany({
          where: { partnerTenantId: { in: tenantIds } },
          select: { userId: true, partnerTenantId: true },
        })
      : [],
  ]);

  const tenantToClerkId = new Map<string, string>();
  const clerkToTenants = new Map<string, { sfTenantId?: string; rpTenantId?: string }>();

  vfAccounts.forEach((a) => {
    tenantToClerkId.set(a.simplefactuTenantId, a.userId);
    const curr = clerkToTenants.get(a.userId) || {};
    clerkToTenants.set(a.userId, { ...curr, sfTenantId: a.simplefactuTenantId });
  });

  partnerAccounts.forEach((a) => {
    tenantToClerkId.set(a.partnerTenantId, a.userId);
    const curr = clerkToTenants.get(a.userId) || {};
    clerkToTenants.set(a.userId, { ...curr, rpTenantId: a.partnerTenantId });
  });

  const clerkUserIds = Array.from(
    new Set([...vfAccounts.map((a) => a.userId), ...partnerAccounts.map((a) => a.userId)])
  );
  let clerkUsers: Awaited<
    ReturnType<Awaited<ReturnType<typeof clerkClient>>["users"]["getUserList"]>
  >["data"] = [];
  if (clerkUserIds.length) {
    try {
      const api = await clerkClient();
      const result = await api.users.getUserList({
        userId: clerkUserIds,
        limit: clerkUserIds.length,
      });
      clerkUsers = result.data;
    } catch {
      // Graceful degradation
    }
  }

  const clerkById = new Map(
    clerkUsers.map((u) => [
      u.id,
      {
        email: u.emailAddresses[0]?.emailAddress ?? null,
        name: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username || null,
        role: (u.publicMetadata as Record<string, unknown>)?.role as string | undefined,
      },
    ])
  );

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (p > 1) params.set("page", String(p));
    if (q) params.set("q", q);
    const qs = params.toString();
    return qs ? `/admin/users?${qs}` : "/admin/users";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-fg">Usuarios</h1>
          <p className="mt-0.5 text-sm text-fg-muted">
            Usuarios web y clientes API — {total} en total
            {q ? "" : `, página ${page} de ${totalPages}`}
          </p>
        </div>
        <CreateTenantForm />
      </div>

      <form method="get" className="flex flex-wrap items-end gap-2">
        <label className="block min-w-[16rem] flex-1 text-sm">
          <span className="text-fg-muted">Buscar</span>
          <input
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Email, tenant ID, NIF, Clerk user_… o job UUID"
            className="mt-1 w-full rounded border border-outline px-3 py-2 text-sm"
          />
        </label>
        <button type="submit" className="btn btn-sm btn-primary">
          Buscar
        </button>
        {q ? (
          <Link href="/admin/users" className="btn btn-sm btn-secondary">
            Limpiar
          </Link>
        ) : null}
      </form>
      {searchNote ? <p className="text-xs text-fg-subtle">{searchNote}</p> : null}

      {apiErr ? (
        <p className="text-sm text-danger-foreground">{apiErr}</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-outline-soft/80 bg-surface/50 backdrop-blur-md shadow-sm overflow-hidden">
            <table className="w-full min-w-[820px] text-left text-sm font-sans">
              <thead className="border-b border-outline-soft/80 bg-surface-muted/65 text-fg-subtle">
                <tr>
                  <th scope="col" className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-fg-subtle">
                    Tipo
                  </th>
                  <th scope="col" className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-fg-subtle">
                    Nombre / Email
                  </th>
                  <th scope="col" className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-fg-subtle">
                    NIF Emisor
                  </th>
                  <th scope="col" className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-fg-subtle">
                    Tenant ID
                  </th>
                  <th scope="col" className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-fg-subtle">
                    Rol
                  </th>
                  <th scope="col" className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-fg-subtle">
                    Plan
                  </th>
                  <th scope="col" className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-fg-subtle">
                    Estado
                  </th>
                  <th scope="col" className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-fg-subtle">
                    Certificado
                  </th>
                  <th scope="col" className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-fg-subtle">
                    Soporte
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-soft/40 font-medium">
                {tenants.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-8 text-center text-sm text-fg-subtle">
                      Sin resultados{q ? ` para «${q}»` : ""}.
                    </td>
                  </tr>
                ) : null}
                {tenants.map((t) => {
                  const clerkId = tenantToClerkId.get(t.id);
                  const clerk = clerkId ? clerkById.get(clerkId) : null;
                  const isWebUser = !!clerk;
                  const isGestoria = t.id.startsWith("rp_") || clerk?.role === "partner";
                  const hasCert = !!t.has_certificate;

                  const pairInfo = clerkId ? clerkToTenants.get(clerkId) : null;
                  const pairedTenantId = pairInfo
                    ? t.id.startsWith("rp_")
                      ? pairInfo.sfTenantId
                      : pairInfo.rpTenantId
                    : null;

                  return (
                    <tr
                      key={t.id}
                      className="group hover:bg-surface-hover/80 transition-colors duration-200 cursor-pointer"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/tenants/${encodeURIComponent(t.id)}`}
                          className="block -mx-5 px-5 -my-4 py-4"
                        >
                          {isGestoria ? (
                            <span className="inline-flex items-center rounded-full bg-accent/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-accent border border-accent/30">
                              Gestoría / API
                            </span>
                          ) : isWebUser ? (
                            <span className="inline-flex items-center rounded-full bg-accent-muted px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-accent-foreground-muted ring-1 ring-accent-outline/20">
                              Usuario web
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-surface-hover px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-fg-subtle ring-1 ring-outline-soft">
                              NIF Emisor (API)
                            </span>
                          )}
                        </Link>
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/tenants/${encodeURIComponent(t.id)}`}
                          className="block -mx-5 px-5 -my-4 py-4"
                        >
                          {isWebUser ? (
                            <div>
                              <p className="font-extrabold text-fg font-display">
                                {clerk!.name ?? t.name ?? "—"}
                              </p>
                              <p className="text-xs text-fg-muted font-sans mt-0.5">
                                {clerk!.email ?? "—"}
                              </p>
                              {pairedTenantId && pairedTenantId !== t.id && (
                                <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-surface-muted px-2 py-0.5 text-[10px] font-sans border border-outline-soft/70">
                                  <span className="text-fg-subtle font-medium">Misma cuenta:</span>
                                  <span className="font-mono font-bold text-accent">
                                    {pairedTenantId.startsWith("rp_")
                                      ? "Gestoría (rp_...)"
                                      : "Autónomo (sf_...)"}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="font-extrabold text-fg font-display">{t.name ?? "—"}</p>
                          )}
                        </Link>
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/tenants/${encodeURIComponent(t.id)}`}
                          className="block -mx-5 px-5 -my-4 py-4 font-mono text-[12px] text-fg font-semibold"
                        >
                          {t.allowed_nif || "—"}
                        </Link>
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/tenants/${encodeURIComponent(t.id)}`}
                          className="block -mx-5 px-5 -my-4 py-4 font-mono text-[13px] font-bold text-accent hover:underline"
                        >
                          {t.id}
                        </Link>
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/tenants/${encodeURIComponent(t.id)}`}
                          className="block -mx-5 px-5 -my-4 py-4"
                        >
                          <RoleBadge role={clerk?.role} />
                        </Link>
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/tenants/${encodeURIComponent(t.id)}`}
                          className="block -mx-5 px-5 -my-4 py-4 font-mono text-[11px] font-medium text-fg-muted bg-surface-muted/80 px-2 py-0.5 rounded border border-outline-soft/40 w-fit"
                        >
                          {t.plan_id}
                        </Link>
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/tenants/${encodeURIComponent(t.id)}`}
                          className="block -mx-5 px-5 -my-4 py-4"
                        >
                          <span
                            className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full ${
                              t.status === "ACTIVE"
                                ? "text-success bg-success/10 border border-success-outline/25"
                                : "text-danger bg-danger/10 border border-danger-outline/25"
                            }`}
                          >
                            {t.status}
                          </span>
                        </Link>
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/tenants/${encodeURIComponent(t.id)}`}
                          className="block -mx-5 px-5 -my-4 py-4"
                        >
                          {hasCert ? (
                            <span
                              title={
                                t.cert_updated_at
                                  ? `Actualizado: ${t.cert_updated_at}`
                                  : "Certificado presente"
                              }
                              className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-success-foreground"
                            >
                              Sí
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-surface-hover px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-fg-subtle ring-1 ring-outline-soft">
                              No
                            </span>
                          )}
                        </Link>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/admin/support?q=${encodeURIComponent(t.id)}`}
                            className="text-xs font-semibold text-accent hover:underline"
                          >
                            Hub
                          </Link>
                          <ImpersonateButton
                            tenantId={t.id}
                            tenantName={clerk?.name ?? t.name}
                            compact
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!q ? (
            <div className="flex gap-4 text-sm">
              {page > 1 ? (
                <Link href={pageHref(page - 1)} className="text-accent hover:underline">
                  Anterior
                </Link>
              ) : null}
              {page < totalPages ? (
                <Link href={pageHref(page + 1)} className="text-accent hover:underline">
                  Siguiente
                </Link>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

async function fetchTenantsByIds(ids: string[]): Promise<AdminTenant[]> {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  const results = await Promise.all(
    unique.map(async (id) => {
      try {
        const data = await getTenant(id);
        return data.tenant ?? null;
      } catch {
        return null;
      }
    })
  );
  return results.filter((t): t is AdminTenant => Boolean(t));
}

async function resolveTenantsByClerkId(
  clerkUserId: string
): Promise<{ tenants: AdminTenant[]; note: string | null }> {
  const [vf, partner] = await Promise.all([
    prisma.userVerifactuAccount.findUnique({
      where: { userId: clerkUserId },
      select: { simplefactuTenantId: true },
    }),
    prisma.userPartnerAccount.findUnique({
      where: { userId: clerkUserId },
      select: { partnerTenantId: true },
    }),
  ]);
  const ids = [vf?.simplefactuTenantId, partner?.partnerTenantId].filter(
    (x): x is string => Boolean(x)
  );
  if (!ids.length) {
    return {
      tenants: [],
      note: `No hay tenant vinculado a Clerk ${clerkUserId} en Neon.`,
    };
  }
  return { tenants: await fetchTenantsByIds(ids), note: null };
}

async function resolveTenantsByEmail(
  email: string
): Promise<{ tenants: AdminTenant[]; note: string | null }> {
  try {
    const api = await clerkClient();
    const result = await api.users.getUserList({ emailAddress: [email], limit: 10 });
    if (!result.data.length) {
      return { tenants: [], note: `Ningún usuario Clerk con email ${email}.` };
    }
    const allIds: string[] = [];
    for (const u of result.data) {
      const [vf, partner] = await Promise.all([
        prisma.userVerifactuAccount.findUnique({
          where: { userId: u.id },
          select: { simplefactuTenantId: true },
        }),
        prisma.userPartnerAccount.findUnique({
          where: { userId: u.id },
          select: { partnerTenantId: true },
        }),
      ]);
      if (vf?.simplefactuTenantId) allIds.push(vf.simplefactuTenantId);
      if (partner?.partnerTenantId) allIds.push(partner.partnerTenantId);
    }
    if (!allIds.length) {
      return {
        tenants: [],
        note: `Usuario Clerk encontrado para ${email}, pero sin tenant provisionado.`,
      };
    }
    return { tenants: await fetchTenantsByIds(allIds), note: null };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error Clerk";
    return { tenants: [], note: `Búsqueda por email falló: ${msg}` };
  }
}

function RoleBadge({ role }: { role?: string }) {
  if (role === "admin") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full text-warning-deep bg-warning/60 border border-warning-outline/40">
        Admin
      </span>
    );
  }
  if (role === "partner") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full text-accent-foreground-muted bg-accent-muted/60 border border-accent-outline/30">
        Integrador
      </span>
    );
  }
  return <span className="text-[10px] font-semibold text-fg-subtle">—</span>;
}
