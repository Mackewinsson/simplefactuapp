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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-fg">Autónomos</h1>
          <p className="mt-0.5 text-sm text-fg-muted">
            Sub-tenants vinculados a tu gestoría ({subtenants.length})
          </p>
        </div>
        <Link
          href="/partner/tenants/new"
          className="btn btn-sm btn-accent"
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
        <div className="panel-premium rounded-2xl p-8 text-center max-w-md mx-auto my-6 border border-outline-soft/75 backdrop-blur-md">
          <svg className="h-10 w-10 text-fg-subtle mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-sm font-bold text-fg mb-1">Aún no hay autónomos</p>
          <p className="text-xs text-fg-muted mb-4 font-sans font-medium">Crea tu primer autónomo para gestionar sus facturas y envíos a la AEAT.</p>
          <Link href="/partner/tenants/new" className="btn btn-sm btn-accent">
            Alta autónomo
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-outline-soft/80 bg-surface/50 backdrop-blur-md shadow-sm overflow-hidden">
          <table className="w-full min-w-[640px] text-left text-sm font-sans">
            <thead className="border-b border-outline-soft/80 bg-surface-muted/65 text-fg-subtle">
              <tr>
                <th scope="col" className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-fg-subtle">ID</th>
                <th scope="col" className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-fg-subtle">Nombre</th>
                <th scope="col" className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-fg-subtle">NIF</th>
                <th scope="col" className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-fg-subtle">Estado</th>
                <th scope="col" className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-fg-subtle">Cert.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-soft/40 font-medium">
              {subtenants.map((t) => (
                <tr
                  key={t.id}
                  className="group hover:bg-surface-hover/80 transition-colors duration-200 cursor-pointer"
                >
                  <td className="px-5 py-4">
                    <Link
                      href={`/partner/tenants/${encodeURIComponent(t.id)}`}
                      className="font-mono text-[13px] font-bold text-accent hover:underline block -mx-5 px-5 -my-4 py-4"
                    >
                      {t.id}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-fg font-extrabold font-display">
                    <Link
                      href={`/partner/tenants/${encodeURIComponent(t.id)}`}
                      className="block -mx-5 px-5 -my-4 py-4"
                    >
                      {t.name || "—"}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-fg font-mono text-[12px]">
                    <Link
                      href={`/partner/tenants/${encodeURIComponent(t.id)}`}
                      className="block -mx-5 px-5 -my-4 py-4"
                    >
                      {t.allowed_nif || "—"}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/partner/tenants/${encodeURIComponent(t.id)}`}
                      className="block -mx-5 px-5 -my-4 py-4"
                    >
                      <span className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full ${
                        t.status === "ACTIVE" 
                          ? "text-success bg-success/10 border border-success-outline/25" 
                          : "text-danger bg-danger/10 border border-danger-outline/25"
                      }`}>
                        {t.status}
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/partner/tenants/${encodeURIComponent(t.id)}`}
                      className="block -mx-5 px-5 -my-4 py-4"
                    >
                      <span className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full ${
                        t.has_certificate
                          ? "text-success bg-success/10 border border-success-outline/25"
                          : "text-fg-subtle bg-surface-muted border border-outline-soft/60"
                      }`}>
                        {t.has_certificate ? "Sí" : "No"}
                      </span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
