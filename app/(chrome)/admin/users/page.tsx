import Link from "next/link";
import { clerkClient } from "@clerk/nextjs/server";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(0, (parseInt(sp.page ?? "0", 10) || 0));

  const api = await clerkClient();
  const { data: users, totalCount } = await api.users.getUserList({
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const ids = users.map((u) => u.id);
  const accounts = await prisma.userVerifactuAccount.findMany({
    where: { userId: { in: ids } },
  });
  const byUserId = new Map(accounts.map((a) => [a.userId, a]));

  const totalPages = Math.max(1, Math.ceil((totalCount ?? 0) / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-fg">Usuarios (Clerk)</h1>
      <p className="text-sm text-fg-muted">
        Total Clerk: {totalCount ?? "—"} — página {page + 1} de {totalPages}
      </p>
      <div className="overflow-x-auto rounded border border-outline-soft bg-surface">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-outline-soft bg-surface-hover text-xs uppercase text-fg-subtle">
            <tr>
              <th className="px-3 py-2">ID de usuario</th>
              <th className="px-3 py-2">Correo</th>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Tenant simplefactu</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const email = u.emailAddresses[0]?.emailAddress ?? "—";
              const name =
                [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username || "—";
              const acc = byUserId.get(u.id);
              return (
                <tr key={u.id} className="border-b border-outline-soft hover:bg-surface-hover">
                  <td className="px-3 py-2 font-mono text-xs">{u.id}</td>
                  <td className="px-3 py-2">{email}</td>
                  <td className="px-3 py-2">{name}</td>
                  <td className="px-3 py-2">
                    {acc ? (
                      <Link
                        href={`/admin/tenants/${encodeURIComponent(acc.simplefactuTenantId)}`}
                        className="font-mono text-xs text-accent hover:underline"
                      >
                        {acc.simplefactuTenantId}
                      </Link>
                    ) : (
                      <span className="text-fg-subtle">Sin cuenta Verifactu</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex gap-4 text-sm">
        {page > 0 ? (
          <Link href={`/admin/users?page=${page - 1}`} className="text-accent hover:underline">
            Anterior
          </Link>
        ) : null}
        {page + 1 < totalPages ? (
          <Link href={`/admin/users?page=${page + 1}`} className="text-accent hover:underline">
            Siguiente
          </Link>
        ) : null}
      </div>
    </div>
  );
}
