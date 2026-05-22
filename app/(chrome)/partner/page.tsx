import Link from "next/link";
import { requirePartner } from "@/lib/auth/partner";
import { listPartnerSubtenants } from "@/lib/simplefactu/partner-server";

export default async function PartnerHomePage() {
  const { userId } = await requirePartner();

  let err: string | null = null;
  let subtenants: Awaited<ReturnType<typeof listPartnerSubtenants>> = [];
  try {
    subtenants = await listPartnerSubtenants(userId);
  } catch (e: unknown) {
    err = e instanceof Error ? e.message : "Error al cargar autónomos";
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-fg">Autónomos</h1>
          <p className="mt-0.5 text-sm text-fg-muted">
            Sub-tenants vinculados a tu gestoría ({subtenants.length})
          </p>
        </div>
        <Link
          href="/partner/tenants/new"
          className="rounded border border-accent-outline bg-accent-muted px-3 py-1.5 text-sm font-medium text-accent-foreground-muted hover:bg-accent-muted-hover"
        >
          + Alta autónomo
        </Link>
      </div>

      {err ? (
        <p className="alert-danger px-3 py-2 text-danger-emphasis">
          {err}
        </p>
      ) : null}

      {subtenants.length === 0 && !err ? (
        <p className="text-sm text-fg-muted">
          Aún no hay autónomos. Crea el primero desde{" "}
          <Link href="/partner/tenants/new" className="text-accent underline-offset-2 hover:underline">
            Alta autónomo
          </Link>
          .
        </p>
      ) : (
        <div className="overflow-x-auto rounded border border-outline-soft">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-outline-soft bg-surface-muted text-fg-muted">
              <tr>
                <th className="px-3 py-2 font-medium">ID</th>
                <th className="px-3 py-2 font-medium">Nombre</th>
                <th className="px-3 py-2 font-medium">NIF</th>
                <th className="px-3 py-2 font-medium">Estado</th>
                <th className="px-3 py-2 font-medium">Cert.</th>
              </tr>
            </thead>
            <tbody>
              {subtenants.map((t) => (
                <tr key={t.id} className="border-b border-outline-soft last:border-0">
                  <td className="px-3 py-2 font-mono text-xs">
                    <Link
                      href={`/partner/tenants/${encodeURIComponent(t.id)}`}
                      className="text-accent hover:underline"
                    >
                      {t.id}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{t.name || "—"}</td>
                  <td className="px-3 py-2 font-mono text-xs">{t.allowed_nif || "—"}</td>
                  <td className="px-3 py-2">{t.status}</td>
                  <td className="px-3 py-2">{t.has_certificate ? "Sí" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
