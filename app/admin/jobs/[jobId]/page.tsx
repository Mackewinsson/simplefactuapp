import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminJob, SimplefactuAdminError } from "@/lib/simplefactu/admin-server";

export default async function AdminJobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  await requireAdmin();
  const { jobId } = await params;
  const id = decodeURIComponent(jobId);

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
        <Link href="/admin/jobs" className="text-sm text-blue-600 hover:underline">
          ← Jobs
        </Link>
        <p className="text-red-700">{loadErr}</p>
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

  return (
    <div className="space-y-4">
      <Link href="/admin/jobs" className="text-sm text-blue-600 hover:underline">
        ← Jobs
      </Link>
      <h1 className="text-xl font-semibold text-gray-900">Job {j.id}</h1>

      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-gray-500">Tenant</dt>
          <dd className="font-mono text-xs">{j.tenant_id}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Tipo / Estado</dt>
          <dd>
            {j.type} — {j.status}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">Intentos</dt>
          <dd>
            {j.attempts} / {j.max_attempts}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">Idempotency</dt>
          <dd className="break-all font-mono text-xs">{j.idempotency_key ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-gray-500">last_error</dt>
          <dd className="break-all text-red-800">{j.last_error ?? "—"}</dd>
        </div>
      </dl>

      {j.payload_json ? (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-800">Payload (JSON)</h2>
          <pre className="max-h-96 overflow-auto rounded border border-gray-200 bg-gray-50 p-3 text-xs">
            {j.payload_json.length > 20000
              ? `${j.payload_json.slice(0, 20000)}\n… (truncado en UI)`
              : j.payload_json}
          </pre>
        </section>
      ) : null}

      {data.result ? (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-800">Último resultado guardado</h2>
          <p className="text-sm text-gray-600">
            HTTP {data.result.httpStatus}
            {data.result.truncated ? " — vista previa truncada" : ""} — {data.result.createdAt}
          </p>
          {previewJson ? (
            <pre className="mt-2 max-h-96 overflow-auto rounded border border-gray-200 bg-gray-50 p-3 text-xs">
              {previewJson}
            </pre>
          ) : null}
        </section>
      ) : (
        <p className="text-sm text-gray-500">Sin fila en job_results.</p>
      )}
    </div>
  );
}
