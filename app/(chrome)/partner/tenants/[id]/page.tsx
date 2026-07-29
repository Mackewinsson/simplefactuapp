import Link from "next/link";
import { requirePartner } from "@/lib/auth/partner";
import {
  getPartnerSubtenant,
  listPartnerJobs,
} from "@/lib/simplefactu/partner-server";
import { PartnerSubtenantActions } from "../../PartnerSubtenantActions";

export default async function PartnerTenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await requirePartner();
  const { id } = await params;

  let tenantErr: string | null = null;
  let tenant: Awaited<ReturnType<typeof getPartnerSubtenant>> | null = null;
  try {
    tenant = await getPartnerSubtenant(userId, id);
  } catch (e: unknown) {
    tenantErr = e instanceof Error ? e.message : "Error al cargar cliente";
  }

  let jobs: Array<Record<string, unknown>> = [];
  if (tenant) {
    try {
      const j = await listPartnerJobs(userId, id);
      jobs = j.jobs.slice(0, 20);
    } catch {
      /* optional */
    }
  }

  if (tenantErr || !tenant) {
    return (
      <div className="space-y-4 animate-fade-in-up">
        <p className="rounded-xl border border-danger-outline/50 bg-danger/80 px-4 py-3 text-sm text-danger-foreground font-semibold">
          {tenantErr ?? "Cliente no encontrado"}
        </p>
        <Link href="/partner" className="btn btn-sm btn-secondary">
          Volver al listado
        </Link>
      </div>
    );
  }

  const isActive = tenant.status === "ACTIVE";
  const hasCert = !!tenant.has_certificate;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Context banner with visual node hierarchy */}
      <div className="rounded-2xl border border-accent/20 bg-accent-muted/20 p-4 text-xs font-display flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-accent bg-accent/15 px-2 py-0.5 rounded-md border border-accent/25">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Cuenta Titular (rp_{userId.slice(0, 8)}…)
          </span>
          <span className="text-fg-subtle font-bold">➔</span>
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-fg bg-surface px-2.5 py-0.5 rounded-md border border-outline-soft">
            NIF Emisor: {tenant.allowed_nif || tenant.id}
          </span>
        </div>
        <span className="text-fg-muted font-medium text-[11px]">
          Ficha de gestión individual
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/partner" className="text-xs text-fg-muted hover:text-fg font-display font-semibold transition-colors">
            ← Volver al listado
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-fg font-display">
            {tenant.name || tenant.id}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-fg-muted">
            <span className="font-mono text-xs bg-surface-muted px-2 py-0.5 rounded border border-outline-soft/50">
              {tenant.id}
            </span>
            {tenant.allowed_nif && (
              <span className="font-mono text-xs">NIF {tenant.allowed_nif}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full ${
              isActive
                ? "text-success-foreground bg-success/60 border border-success-outline/25"
                : "text-danger-foreground bg-danger/60 border border-danger-outline/25"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-success-emphasis" : "bg-danger-emphasis"}`} />
            {isActive ? "Activo" : "Suspendido"}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full ${
              hasCert
                ? "text-success-foreground bg-success/60 border border-success-outline/25"
                : "text-fg-subtle bg-surface-muted border border-outline-soft/60"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${hasCert ? "bg-success-emphasis" : "bg-fg-subtle/40"}`} />
            {hasCert ? "Certificado cargado" : "Sin certificado"}
          </span>
        </div>
      </div>

      {/* Checklist & Onboarding Progress Card */}
      <div className="panel-premium rounded-2xl p-6">
        <h2 className="text-sm font-bold text-fg font-display tracking-tight mb-3">
          Estado de Integración de este NIF Emisor
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 p-3 rounded-xl border border-success-outline/30 bg-success/10 text-success-foreground">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-emphasis text-white font-bold text-xs">✓</span>
            <div>
              <p className="text-xs font-bold font-display">1. Datos Fiscales</p>
              <p className="text-[11px] opacity-80 font-mono">{tenant.allowed_nif || "NIF Asignado"}</p>
            </div>
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-xl border ${hasCert ? "border-success-outline/30 bg-success/10 text-success-foreground" : "border-warning-outline/30 bg-warning/10 text-warning-foreground"}`}>
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bold text-xs ${hasCert ? "bg-success-emphasis text-white" : "bg-warning-emphasis text-white"}`}>
              {hasCert ? "✓" : "2"}
            </span>
            <div>
              <p className="text-xs font-bold font-display">2. Certificado PFX</p>
              <p className="text-[11px] opacity-80">{hasCert ? "Cargado correctamente" : "Pendiente de subir"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl border border-outline-soft bg-surface-muted/40 text-fg-muted">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-white font-bold text-xs">3</span>
            <div>
              <p className="text-xs font-bold font-display text-fg">3. Listo para Emitir</p>
              <p className="text-[11px]">Vía Partner Key o Clave Dedicada</p>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Code Snippet (Marca Blanca Guide) */}
      <div className="panel-premium rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-outline-soft/60 pb-3">
          <div>
            <h2 className="text-base font-bold text-fg font-display tracking-tight">
              ¿Cómo emitir facturas para este NIF por API? (Marca Blanca)
            </h2>
            <p className="text-xs text-fg-muted">
              Usa tu clave Partner principal enviando el identificador del tenant en la llamada.
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold bg-accent/15 text-accent px-2.5 py-1 rounded-full border border-accent/25">
            REST API
          </span>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold text-fg font-display">Ejemplo de llamada POST /v1/send-invoice:</p>
          <pre className="p-4 rounded-xl bg-surface-dark font-mono text-xs text-fg-on-dark overflow-x-auto border border-outline-soft/40">
{`curl -X POST "${process.env.NEXT_PUBLIC_SIMPLEFACTU_API_BASE_URL || "https://api.simplefactu.com/v1"}/send-invoice" \\
  -H "x-api-key: $SU_CLAVE_PARTNER" \\
  -H "x-idempotency-key: job-factura-${tenant.allowed_nif || tenant.id}-001" \\
  -H "Content-Type: application/json" \\
  -d '{
    "tenant_id": "${tenant.id}",
    "factura": {
      "NumSerieFactura": "F-2026-0001",
      "FechaExpedicionFactura": "29-07-2026",
      "ObligadoEmision": { "NIF": "${tenant.allowed_nif || "B12345678"}", "NombreRazon": "${tenant.name || "Empresa SL"}" }
    }
  }'`}
          </pre>
        </div>
      </div>

      {/* Panels grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel-premium rounded-2xl p-6">
          <h2 className="text-base font-bold text-fg font-display tracking-tight border-b border-outline-soft/60 pb-2 mb-5">
            Acciones & Credenciales
          </h2>
          <PartnerSubtenantActions childId={tenant.id} status={tenant.status} />
        </section>

        <section className="panel-premium rounded-2xl p-6">
          <h2 className="text-base font-bold text-fg font-display tracking-tight border-b border-outline-soft/60 pb-2 mb-5">
            Últimos envíos AEAT
          </h2>
          {jobs.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-fg-muted font-medium">
                Sin envíos recientes para este cliente.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-80 overflow-y-auto">
              {jobs.map((job) => {
                const jobId = String(job.id ?? "");
                const st = String(job.status ?? "");
                const typ = String(job.type ?? "");
                const statusColor = getJobStatusColor(st);
                return (
                  <div
                    key={jobId}
                    className="flex items-center justify-between rounded-lg border border-outline-soft/40 bg-surface/80 px-3 py-2.5 text-xs"
                  >
                    <span className="font-mono font-bold text-fg-muted">{jobId.slice(0, 12)}…</span>
                    <div className="flex items-center gap-2">
                      <span className="text-fg-subtle font-medium">{typ}</span>
                      <span className={`inline-flex items-center gap-1 font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-[9px] ${statusColor}`}>
                        {st}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function getJobStatusColor(status: string): string {
  switch (status) {
    case "SUCCEEDED":
      return "text-success-foreground bg-success/50 border border-success-outline/30";
    case "FAILED":
    case "DEAD":
      return "text-danger-foreground bg-danger/50 border border-danger-outline/30";
    case "PENDING":
    case "PROCESSING":
      return "text-warning-deep bg-warning/50 border border-warning-outline/30";
    default:
      return "text-fg-muted bg-surface-muted border border-outline-soft/40";
  }
}
