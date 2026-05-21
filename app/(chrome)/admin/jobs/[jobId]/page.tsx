import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminJob, getAeatConsulta, SimplefactuAdminError } from "@/lib/simplefactu/admin-server";
import { RetryJobButton } from "./RetryJobButton";

export default async function AdminJobDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<{ consulta?: string }>;
}) {
  await requireAdmin();
  const { jobId } = await params;
  const sp = await searchParams;
  const id = decodeURIComponent(jobId);
  const showConsulta = sp.consulta === "1";

  let data: Awaited<ReturnType<typeof getAdminJob>> | null = null;
  let loadErr: string | null = null;
  try {
    data = await getAdminJob(id);
  } catch (e: unknown) {
    if (e instanceof SimplefactuAdminError && e.status === 404) {
      notFound();
    }
    loadErr = e instanceof Error ? e.message : "Error al cargar el job";
  }

  if (loadErr) {
    return (
      <div className="space-y-4">
        <Link href="/admin/jobs" className="text-sm text-accent hover:underline">
          ← Jobs AEAT
        </Link>
        <p className="text-danger-foreground">{loadErr}</p>
      </div>
    );
  }

  if (!data?.job) {
    notFound();
  }

  const j = data.job;
  const preview = data.result?.responsePreview;
  const previewJson =
    preview !== undefined ? JSON.stringify(preview, null, 2).slice(0, 12000) : null;

  // Parse payload to extract AEAT consulta params
  let consultaNif: string | null = null;
  let consultaNumSerie: string | null = null;
  let consultaFecha: string | null = null;
  if (j.payload_json) {
    try {
      const p = JSON.parse(j.payload_json) as Record<string, unknown>;
      const invoice = (p.invoice ?? p) as Record<string, unknown>;
      consultaNif = String(invoice.nif ?? "");
      consultaNumSerie = String(invoice.numSerie ?? invoice.num_serie ?? "");
      consultaFecha = String(invoice.fecha ?? "");
    } catch { /* skip */ }
  }

  let consulta: Awaited<ReturnType<typeof getAeatConsulta>> | null = null;
  let consultaErr: string | null = null;
  if (showConsulta && consultaNif && consultaNumSerie && consultaFecha) {
    try {
      consulta = await getAeatConsulta({ nif: consultaNif, numSerie: consultaNumSerie, fecha: consultaFecha });
    } catch (e: unknown) {
      consultaErr = e instanceof Error ? e.message : "Error al consultar AEAT";
    }
  }

  return (
    <div className="space-y-4">
      <Link href="/admin/jobs" className="text-sm text-accent hover:underline">
        ← Jobs AEAT
      </Link>
      <h1 className="text-xl font-semibold text-fg">Trabajo {j.id}</h1>

      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-fg-subtle">Tenant (API)</dt>
          <dd className="font-mono text-xs">
            <Link
              href={`/admin/tenants/${encodeURIComponent(j.tenant_id)}`}
              className="text-accent hover:underline"
            >
              {j.tenant_id}
            </Link>
          </dd>
        </div>
        <div>
          <dt className="text-fg-subtle">Tipo / Estado</dt>
          <dd>
            {j.type} — {j.status}
          </dd>
        </div>
        <div>
          <dt className="text-fg-subtle">Intentos</dt>
          <dd>
            {j.attempts} / {j.max_attempts}
          </dd>
        </div>
        <div>
          <dt className="text-fg-subtle">Idempotency</dt>
          <dd className="break-all font-mono text-xs">{j.idempotency_key ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-fg-subtle">Último error</dt>
          <dd className="break-all text-danger-foreground">{j.last_error ?? "—"}</dd>
        </div>
      </dl>

      {j.payload_json ? (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-fg">Cuerpo enviado (JSON)</h2>
          <pre className="max-h-96 overflow-auto rounded border border-outline-soft bg-surface-hover p-3 text-xs">
            {j.payload_json.length > 20000
              ? `${j.payload_json.slice(0, 20000)}\n… (truncado en UI)`
              : j.payload_json}
          </pre>
        </section>
      ) : null}

      <RetryJobButton jobId={j.id} status={j.status} />

      {data.result ? (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-fg">Último resultado guardado</h2>
          <p className="text-sm text-fg-muted">
            HTTP {data.result.httpStatus}
            {data.result.truncated ? " — vista previa truncada" : ""} — {data.result.createdAt}
          </p>
          {previewJson ? (
            <pre className="mt-2 max-h-96 overflow-auto rounded border border-outline-soft bg-surface-hover p-3 text-xs">
              {previewJson}
            </pre>
          ) : null}
        </section>
      ) : (
        <p className="text-sm text-fg-subtle">Sin fila en job_results.</p>
      )}

      {/* AEAT Consulta */}
      <section className="rounded-lg border border-outline-soft bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-fg">Consulta AEAT</h2>
          {!showConsulta && consultaNif && (
            <Link
              href={`/admin/jobs/${encodeURIComponent(j.id)}?consulta=1`}
              className="rounded border border-outline-soft px-3 py-1 text-xs text-accent hover:bg-surface-hover hover:underline"
            >
              Consultar estado en AEAT →
            </Link>
          )}
        </div>
        {!consultaNif ? (
          <p className="mt-2 text-xs text-fg-subtle">Sin datos de factura disponibles en el payload.</p>
        ) : showConsulta ? (
          consultaErr ? (
            <p className="mt-2 text-sm text-danger-foreground">{consultaErr}</p>
          ) : consulta ? (
            <pre className="mt-2 max-h-64 overflow-auto rounded bg-surface-hover p-3 text-xs">
              {JSON.stringify(consulta, null, 2)}
            </pre>
          ) : null
        ) : (
          <p className="mt-2 text-xs text-fg-muted">
            NIF: <span className="font-mono">{consultaNif}</span> — Serie:{" "}
            <span className="font-mono">{consultaNumSerie}</span> — Fecha:{" "}
            <span className="font-mono">{consultaFecha}</span>
          </p>
        )}
      </section>
    </div>
  );
}
