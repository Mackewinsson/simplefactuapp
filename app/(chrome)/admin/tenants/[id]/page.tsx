import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import {
  getTenant,
  getTenantCertificateMeta,
  getTenantChains,
  listApiKeysForTenant,
  SimplefactuAdminError,
} from "@/lib/simplefactu/admin-server";
import { TenantDetailForms } from "@/app/(chrome)/admin/tenants/TenantDetailForms";
import { TenantKeysAndCert } from "@/app/(chrome)/admin/tenants/TenantKeysAndCert";

export default async function AdminTenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const tenantId = decodeURIComponent(id);

  let tenantRes: Awaited<ReturnType<typeof getTenant>> | null = null;
  let cert: Awaited<ReturnType<typeof getTenantCertificateMeta>> | null = null;
  let keys: Awaited<ReturnType<typeof listApiKeysForTenant>>["keys"] = [];
  let chains: Awaited<ReturnType<typeof getTenantChains>> | null = null;
  let err: string | null = null;
  try {
    tenantRes = await getTenant(tenantId);
  } catch (e: unknown) {
    if (e instanceof SimplefactuAdminError && e.status === 404) {
      notFound();
    }
    err = e instanceof Error ? e.message : "Error";
  }

  if (tenantRes?.tenant) {
    try {
      cert = await getTenantCertificateMeta(tenantId);
    } catch {
      cert = null;
    }
    try {
      const k = await listApiKeysForTenant(tenantId);
      keys = k.keys ?? [];
    } catch {
      keys = [];
    }
    try {
      chains = await getTenantChains(tenantId);
    } catch {
      chains = null;
    }
  }

  if (!tenantRes?.tenant) {
    return (
      <div>
        <p className="text-red-700">{err ?? "Tenant no encontrado"}</p>
        <Link href="/admin/tenants" className="text-sm text-blue-600 hover:underline">
          Volver
        </Link>
      </div>
    );
  }

  const t = tenantRes.tenant;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/tenants" className="text-sm text-blue-600 hover:underline">
          ← Tenants
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-gray-900">Tenant: {t.id}</h1>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-gray-800">Certificado (resumen)</h2>
        {cert ? (
          <dl className="text-sm text-gray-600">
            <div>
              <dt className="inline text-gray-500">Tiene certificado:</dt>{" "}
              <dd className="inline">{cert.hasCertificate ? "Sí" : "No"}</dd>
            </div>
            {cert.updatedAt ? (
              <div>
                <dt className="inline text-gray-500">Actualizado:</dt>{" "}
                <dd className="inline">{cert.updatedAt}</dd>
              </div>
            ) : null}
          </dl>
        ) : (
          <p className="text-sm text-gray-500">No se pudo cargar el estado del certificado.</p>
        )}
      </section>

      <TenantDetailForms tenant={t} />

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-800">Encadenamiento (chain_registry)</h2>
        {chains?.chains?.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-2 py-2">chain_key</th>
                  <th className="px-2 py-2">last_huella</th>
                  <th className="px-2 py-2">updated_at</th>
                </tr>
              </thead>
              <tbody>
                {chains.chains.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100">
                    <td className="px-2 py-2 font-mono">{c.chainKey}</td>
                    <td className="max-w-[200px] truncate px-2 py-2 font-mono" title={c.lastHuella}>
                      {c.lastHuella}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">{c.updatedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            {chains ? "Sin filas en chain_registry para este tenant." : "No se pudo cargar la cadena."}
          </p>
        )}
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <TenantKeysAndCert
          tenantId={tenantId}
          initialKeys={keys}
          hasCertificate={cert?.hasCertificate ?? false}
        />
      </section>
    </div>
  );
}
