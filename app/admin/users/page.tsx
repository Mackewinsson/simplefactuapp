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
      <h1 className="text-xl font-semibold text-gray-900">Usuarios (Clerk)</h1>
      <p className="text-sm text-gray-600">
        Total Clerk: {totalCount ?? "—"} — página {page + 1} de {totalPages}
      </p>
      <div className="overflow-x-auto rounded border border-gray-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-2">ID de usuario</th>
              <th className="px-3 py-2">Email</th>
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
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 font-mono text-xs">{u.id}</td>
                  <td className="px-3 py-2">{email}</td>
                  <td className="px-3 py-2">{name}</td>
                  <td className="px-3 py-2">
                    {acc ? (
                      <Link
                        href={`/admin/tenants/${encodeURIComponent(acc.simplefactuTenantId)}`}
                        className="font-mono text-xs text-blue-600 hover:underline"
                      >
                        {acc.simplefactuTenantId}
                      </Link>
                    ) : (
                      <span className="text-gray-400">Sin cuenta Verifactu</span>
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
          <Link href={`/admin/users?page=${page - 1}`} className="text-blue-600 hover:underline">
            Anterior
          </Link>
        ) : null}
        {page + 1 < totalPages ? (
          <Link href={`/admin/users?page=${page + 1}`} className="text-blue-600 hover:underline">
            Siguiente
          </Link>
        ) : null}
      </div>
    </div>
  );
}
