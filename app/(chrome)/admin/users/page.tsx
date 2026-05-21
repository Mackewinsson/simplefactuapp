import Link from "next/link";
import { clerkClient } from "@clerk/nextjs/server";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import { listTenants } from "@/lib/simplefactu/admin-server";
import { CreateTenantForm } from "../tenants/CreateTenantForm";

const PAGE_SIZE = 50;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  // Primary data source: all tenants from the simplefactu API
  let data: Awaited<ReturnType<typeof listTenants>> | null = null;
  let apiErr: string | null = null;
  try {
    data = await listTenants(PAGE_SIZE, offset);
  } catch (e: unknown) {
    apiErr = e instanceof Error ? e.message : "Error al listar usuarios";
  }

  const tenants = data?.tenants ?? [];
  const total = data?.pagination.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Enrich with Clerk data: find which tenant IDs map to a Clerk user
  const tenantIds = tenants.map((t) => t.id);
  const accounts = tenantIds.length
    ? await prisma.userVerifactuAccount.findMany({
        where: { simplefactuTenantId: { in: tenantIds } },
        select: { userId: true, simplefactuTenantId: true },
      })
    : [];

  // Build lookup: tenantId → clerkUserId
  const tenantToClerkId = new Map(accounts.map((a) => [a.simplefactuTenantId, a.userId]));

  // Fetch Clerk users in a single batch (only for matched accounts)
  const clerkUserIds = accounts.map((a) => a.userId);
  let clerkUsers: Awaited<ReturnType<Awaited<ReturnType<typeof clerkClient>>["users"]["getUserList"]>>["data"] = [];
  if (clerkUserIds.length) {
    try {
      const api = await clerkClient();
      const result = await api.users.getUserList({ userId: clerkUserIds, limit: clerkUserIds.length });
      clerkUsers = result.data;
    } catch {
      // Graceful degradation: show tenant data without Clerk enrichment
    }
  }

  // Build lookup: clerkUserId → { email, name }
  const clerkById = new Map(
    clerkUsers.map((u) => [
      u.id,
      {
        email: u.emailAddresses[0]?.emailAddress ?? null,
        name: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username || null,
      },
    ])
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-fg">Usuarios</h1>
          <p className="mt-0.5 text-sm text-fg-muted">
            Usuarios web y clientes API — {total} en total, página {page} de {totalPages}
          </p>
        </div>
        <CreateTenantForm />
      </div>

      {apiErr ? (
        <p className="text-sm text-danger-foreground">{apiErr}</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded border border-outline-soft bg-surface">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-outline-soft bg-surface-hover text-xs uppercase text-fg-subtle">
                <tr>
                  <th className="px-3 py-2">Tipo</th>
                  <th className="px-3 py-2">Nombre / Email</th>
                  <th className="px-3 py-2">Tenant ID</th>
                  <th className="px-3 py-2">Plan</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2">Certificado</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => {
                  const clerkId = tenantToClerkId.get(t.id);
                  const clerk = clerkId ? clerkById.get(clerkId) : null;
                  const isWebUser = !!clerk;
                  const hasCert = !!t.has_certificate;

                  return (
                    <tr key={t.id} className="border-b border-outline-soft hover:bg-surface-hover">
                      {/* Tipo */}
                      <td className="px-3 py-2">
                        {isWebUser ? (
                          <span className="inline-flex items-center rounded-full bg-accent-muted px-2 py-0.5 text-xs font-medium text-accent-foreground-muted">
                            Usuario web
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-surface-hover px-2 py-0.5 text-xs font-medium text-fg-subtle ring-1 ring-outline-soft">
                            Cliente API
                          </span>
                        )}
                      </td>

                      {/* Nombre / Email */}
                      <td className="px-3 py-2">
                        {isWebUser ? (
                          <div>
                            <p className="font-medium text-fg">{clerk!.name ?? "—"}</p>
                            <p className="text-xs text-fg-muted">{clerk!.email ?? "—"}</p>
                          </div>
                        ) : (
                          <p className="text-fg">{t.name ?? "—"}</p>
                        )}
                      </td>

                      {/* Tenant ID */}
                      <td className="px-3 py-2 font-mono text-xs text-fg-muted">{t.id}</td>

                      {/* Plan */}
                      <td className="px-3 py-2 text-fg-muted">{t.plan_id}</td>

                      {/* Estado */}
                      <td className="px-3 py-2">
                        <span
                          className={
                            t.status === "ACTIVE"
                              ? "text-success-foreground"
                              : "text-warning-deeper"
                          }
                        >
                          {t.status}
                        </span>
                      </td>

                      {/* Certificado */}
                      <td className="px-3 py-2">
                        {hasCert ? (
                          <span
                            title={
                              t.cert_updated_at
                                ? `Actualizado: ${t.cert_updated_at}`
                                : "Certificado presente"
                            }
                            className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success-foreground"
                          >
                            ✓ Sí
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-surface-hover px-2 py-0.5 text-xs text-fg-subtle">
                            — No
                          </span>
                        )}
                      </td>

                      {/* Acción */}
                      <td className="px-3 py-2">
                        <Link
                          href={`/admin/tenants/${encodeURIComponent(t.id)}`}
                          className="text-accent hover:underline"
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex gap-4 text-sm">
            {page > 1 ? (
              <Link href={`/admin/users?page=${page - 1}`} className="text-accent hover:underline">
                Anterior
              </Link>
            ) : null}
            {page < totalPages ? (
              <Link href={`/admin/users?page=${page + 1}`} className="text-accent hover:underline">
                Siguiente
              </Link>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
