import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import {
  getTenant,
  getTenantCertificateMeta,
  SimplefactuAdminError,
} from "@/lib/simplefactu/admin-server";
import { TenantDetailForms } from "@/app/admin/tenants/TenantDetailForms";

export default async function AdminTenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const tenantId = decodeURIComponent(id);

  let tenantRes: Awaited<ReturnType<typeof getTenant>> | null = null;
  let cert: Awaited<ReturnType<typeof getTenantCertificateMeta>> | null = null;
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
        <h2 className="mb-2 text-sm font-semibold text-gray-800">Certificado (DB)</h2>
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

      <p className="text-xs text-gray-500">
        Rotación de API keys y subida de certificado siguen disponibles vía API simplefactu (`/admin/api-keys`,
        `/admin/tenant/certificate`) si las necesitas en una siguiente iteración del panel.
      </p>
    </div>
  );
}
