import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import {
  getTenant,
  getTenantCertificateMeta,
  getTenantChains,
  listApiKeysForTenant,
  getAdminInvoiceRecords,
  getTenantWebhook,
  getTenantEmailPrefs,
  SimplefactuAdminError,
} from "@/lib/simplefactu/admin-server";
import { TenantDetailForms } from "@/app/(chrome)/admin/tenants/TenantDetailForms";
import { TenantKeysAndCert } from "@/app/(chrome)/admin/tenants/TenantKeysAndCert";
import { TenantWebhookForm } from "@/app/(chrome)/admin/tenants/TenantWebhookForm";
import { TenantEmailPrefsForm } from "@/app/(chrome)/admin/tenants/TenantEmailPrefsForm";

const INVOICE_PAGE_SIZE = 20;

export default async function AdminTenantDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ipage?: string; from?: string; to?: string; serie?: string; tipo?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const tenantId = decodeURIComponent(id);

  const ipage = Math.max(1, parseInt(sp.ipage ?? "1", 10) || 1);
  const ioffset = (ipage - 1) * INVOICE_PAGE_SIZE;
  const invoiceFrom = sp.from?.trim() || undefined;
  const invoiceTo = sp.to?.trim() || undefined;
  const invoiceSerie = sp.serie?.trim() || undefined;
  const invoiceTipo = sp.tipo?.trim() || undefined;

  let tenantRes: Awaited<ReturnType<typeof getTenant>> | null = null;
  let cert: Awaited<ReturnType<typeof getTenantCertificateMeta>> | null = null;
  let keys: Awaited<ReturnType<typeof listApiKeysForTenant>>["keys"] = [];
  let chains: Awaited<ReturnType<typeof getTenantChains>> | null = null;
  let invoices: Awaited<ReturnType<typeof getAdminInvoiceRecords>> | null = null;
  let webhook: Awaited<ReturnType<typeof getTenantWebhook>> | null = null;
  let emailPrefs: Awaited<ReturnType<typeof getTenantEmailPrefs>> | null = null;
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
    await Promise.allSettled([
      getTenantCertificateMeta(tenantId).then((r) => { cert = r; }).catch(() => {}),
      listApiKeysForTenant(tenantId).then((r) => { keys = r.keys ?? []; }).catch(() => {}),
      getTenantChains(tenantId).then((r) => { chains = r; }).catch(() => {}),
      getAdminInvoiceRecords(tenantId, {
        from: invoiceFrom, to: invoiceTo, serie: invoiceSerie, tipo: invoiceTipo,
        limit: INVOICE_PAGE_SIZE, offset: ioffset,
      }).then((r) => { invoices = r; }).catch(() => {}),
      getTenantWebhook(tenantId).then((r) => { webhook = r; }).catch(() => {}),
      getTenantEmailPrefs(tenantId).then((r) => { emailPrefs = r; }).catch(() => {}),
    ]);
  }

  if (!tenantRes?.tenant) {
    return (
      <div>
        <p className="text-danger-foreground">{err ?? "Tenant no encontrado"}</p>
        <Link href="/admin/users" className="text-sm text-accent hover:underline">
          Volver
        </Link>
      </div>
    );
  }

  const t = tenantRes.tenant;

  const invoiceTotal = invoices?.pagination.total ?? 0;
  const invoiceTotalPages = Math.max(1, Math.ceil(invoiceTotal / INVOICE_PAGE_SIZE));

  function invoiceHref(p: number, extra?: Record<string, string>) {
    const q = new URLSearchParams();
    q.set("ipage", String(p));
    if (invoiceFrom) q.set("from", invoiceFrom);
    if (invoiceTo) q.set("to", invoiceTo);
    if (invoiceSerie) q.set("serie", invoiceSerie);
    if (invoiceTipo) q.set("tipo", invoiceTipo);
    if (extra) Object.entries(extra).forEach(([k, v]) => q.set(k, v));
    return `/admin/tenants/${encodeURIComponent(tenantId)}?${q}`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/users" className="text-sm text-accent hover:underline">
            ← Usuarios
          </Link>
          <h1 className="mt-2 text-xl font-semibold text-fg">Tenant: {t.id}</h1>
          {t.name && <p className="text-sm text-fg-muted">{t.name}</p>}
        </div>
        <Link
          href={`/admin/jobs?tenant_id=${encodeURIComponent(tenantId)}`}
          className="rounded border border-outline-soft bg-surface px-3 py-1.5 text-sm text-accent hover:bg-surface-hover hover:underline"
        >
          Ver jobs de este tenant →
        </Link>
      </div>

      {/* Certificate summary */}
      <section className="rounded-lg border border-outline-soft bg-surface p-4">
        <h2 className="mb-2 text-sm font-semibold text-fg">Certificado (resumen)</h2>
        {cert ? (
          <dl className="text-sm text-fg-muted">
            <div>
              <dt className="inline text-fg-subtle">Tiene certificado:</dt>{" "}
              <dd className="inline">{cert.hasCertificate ? "Sí" : "No"}</dd>
            </div>
            {cert.updatedAt ? (
              <div>
                <dt className="inline text-fg-subtle">Actualizado:</dt>{" "}
                <dd className="inline">{cert.updatedAt}</dd>
              </div>
            ) : null}
          </dl>
        ) : (
          <p className="text-sm text-fg-subtle">No se pudo cargar el estado del certificado.</p>
        )}
      </section>

      {/* Tenant forms (patch + maintenance) */}
      <TenantDetailForms tenant={t} />

      {/* Chains */}
      <section className="rounded-lg border border-outline-soft bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold text-fg">Encadenamiento (chain_registry)</h2>
        {chains?.chains?.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="border-b border-outline-soft bg-surface-hover">
                <tr>
                  <th className="px-2 py-2">chain_key</th>
                  <th className="px-2 py-2">last_huella</th>
                  <th className="px-2 py-2">last_timestamp</th>
                  <th className="px-2 py-2">updated_at</th>
                </tr>
              </thead>
              <tbody>
                {chains.chains.map((c) => (
                  <tr key={c.id} className="border-b border-outline-soft">
                    <td className="px-2 py-2 font-mono">{c.chainKey}</td>
                    <td className="max-w-[180px] truncate px-2 py-2 font-mono" title={c.lastHuella}>
                      {c.lastHuella}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-fg-muted">
                      {c.lastTimestamp ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2">{c.updatedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-fg-subtle">
            {chains ? "Sin filas en chain_registry para este tenant." : "No se pudo cargar la cadena."}
          </p>
        )}
      </section>

      {/* Invoice ledger */}
      <section className="rounded-lg border border-outline-soft bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold text-fg">Facturas registradas</h2>
        <form className="mb-4 flex flex-wrap items-end gap-3 text-sm" method="get">
          <label className="block">
            <span className="text-fg-muted">Desde</span>
            <input name="from" type="text" defaultValue={invoiceFrom ?? ""} placeholder="DD-MM-YYYY"
              className="mt-1 block w-32 rounded border border-outline px-2 py-1 font-mono text-xs" />
          </label>
          <label className="block">
            <span className="text-fg-muted">Hasta</span>
            <input name="to" type="text" defaultValue={invoiceTo ?? ""} placeholder="DD-MM-YYYY"
              className="mt-1 block w-32 rounded border border-outline px-2 py-1 font-mono text-xs" />
          </label>
          <label className="block">
            <span className="text-fg-muted">Serie</span>
            <input name="serie" type="text" defaultValue={invoiceSerie ?? ""} placeholder="2026"
              className="mt-1 block w-24 rounded border border-outline px-2 py-1 font-mono text-xs" />
          </label>
          <label className="block">
            <span className="text-fg-muted">Tipo</span>
            <select name="tipo" defaultValue={invoiceTipo ?? ""}
              className="mt-1 block rounded border border-outline px-2 py-1 text-xs">
              <option value="">Todos</option>
              <option value="ALTA">ALTA</option>
              <option value="ANULACION">ANULACION</option>
            </select>
          </label>
          <input type="hidden" name="ipage" value="1" />
          <button type="submit"
            className="rounded bg-primary-hover px-3 py-1 text-primary-foreground hover:bg-primary-hover">
            Filtrar
          </button>
        </form>

        {invoices?.records?.length ? (
          <>
            <p className="mb-2 text-xs text-fg-muted">
              {invoiceTotal} registros — página {ipage} de {invoiceTotalPages}
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="border-b border-outline-soft bg-surface-hover text-[10px] uppercase text-fg-subtle">
                  <tr>
                    <th className="px-2 py-2">Fecha</th>
                    <th className="px-2 py-2">Num. serie</th>
                    <th className="px-2 py-2">Tipo</th>
                    <th className="px-2 py-2">Estado</th>
                    <th className="px-2 py-2">CSV</th>
                    <th className="px-2 py-2">Huella</th>
                    <th className="px-2 py-2">Registrado</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.records.map((r) => (
                    <tr key={r.id} className="border-b border-outline-soft hover:bg-surface-hover">
                      <td className="whitespace-nowrap px-2 py-2">{r.fecha}</td>
                      <td className="px-2 py-2 font-mono">{r.num_serie}</td>
                      <td className="px-2 py-2">
                        <span className={r.tipo === "ALTA"
                          ? "text-success-foreground"
                          : "text-warning-deeper"}>
                          {r.tipo}
                        </span>
                      </td>
                      <td className="px-2 py-2">
                        <span className={r.estado === "Correcto"
                          ? "text-success-foreground"
                          : "text-warning-deeper"}>
                          {r.estado}
                        </span>
                      </td>
                      <td className="px-2 py-2 font-mono text-fg-muted">{r.csv ?? "—"}</td>
                      <td className="max-w-[120px] truncate px-2 py-2 font-mono text-fg-subtle"
                        title={r.huella}>{r.huella.slice(0, 12)}…</td>
                      <td className="whitespace-nowrap px-2 py-2 text-fg-muted">{r.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex gap-4 text-sm">
              {ipage > 1 && (
                <Link href={invoiceHref(ipage - 1)} className="text-accent hover:underline">Anterior</Link>
              )}
              {ipage < invoiceTotalPages && (
                <Link href={invoiceHref(ipage + 1)} className="text-accent hover:underline">Siguiente</Link>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-fg-subtle">
            {invoices ? "Sin facturas registradas con estos filtros." : "No se pudo cargar el ledger de facturas."}
          </p>
        )}
      </section>

      {/* Webhook */}
      <TenantWebhookForm tenantId={tenantId} initial={webhook} />

      {/* Email prefs */}
      <TenantEmailPrefsForm tenantId={tenantId} initial={emailPrefs} />

      {/* Keys + cert */}
      <section className="rounded-lg border border-outline-soft bg-surface p-4">
        <TenantKeysAndCert
          tenantId={tenantId}
          initialKeys={keys}
          hasCertificate={cert?.hasCertificate ?? false}
        />
      </section>
    </div>
  );
}
