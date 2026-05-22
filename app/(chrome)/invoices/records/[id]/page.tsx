import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { fetchInvoiceRecordById } from "@/lib/simplefactu/invoice-records";
import { formatVerifactuActionError } from "@/lib/simplefactu/api-errors";

export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("es", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function InvoiceRecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  let record: Awaited<ReturnType<typeof fetchInvoiceRecordById>> | null = null;
  let loadError: string | null = null;

  try {
    record = await fetchInvoiceRecordById(userId, id);
  } catch (e) {
    const msg = formatVerifactuActionError(e);
    if (msg.includes("404") || msg.toLowerCase().includes("not found")) {
      notFound();
    }
    loadError = msg;
  }

  if (loadError) {
    return (
      <div>
        <Link href="/invoices/records" className="text-sm text-fg-muted hover:text-fg">
          ← Registro AEAT
        </Link>
        <div className="mt-4 rounded border border-danger-outline bg-danger p-4 text-sm text-danger-foreground">
          {loadError}
        </div>
      </div>
    );
  }

  if (!record) notFound();

  return (
    <div>
      <Link href="/invoices/records" className="text-sm text-fg-muted hover:text-fg">
        ← Registro AEAT
      </Link>

      <h1 className="mt-4 text-2xl font-semibold">{record.numSerie}</h1>
      <p className="mt-1 text-sm text-fg-muted">
        {record.tipo} · {record.estado} · registrado{" "}
        {dateFormat.format(new Date(record.createdAt))}
      </p>

      <dl className="mt-6 grid gap-3 rounded border border-outline-soft bg-surface p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-fg-muted">NIF emisor</dt>
          <dd className="font-medium">{record.nifEmisor}</dd>
        </div>
        <div>
          <dt className="text-fg-muted">Serie</dt>
          <dd>{record.serie}</dd>
        </div>
        <div>
          <dt className="text-fg-muted">Fecha expedición</dt>
          <dd>{record.fecha}</dd>
        </div>
        <div>
          <dt className="text-fg-muted">CSV AEAT</dt>
          <dd className="font-mono text-xs">{record.csv ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-fg-muted">Nº instalación</dt>
          <dd className="font-mono text-xs">{record.numeroInstalacion ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-fg-muted">Fecha/hora registro</dt>
          <dd className="font-mono text-xs">{record.fechaHoraHusoGenRegistro ?? "—"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-fg-muted">Huella</dt>
          <dd className="break-all font-mono text-xs">{record.huella}</dd>
        </div>
        {record.huellaAnterior ? (
          <div className="sm:col-span-2">
            <dt className="text-fg-muted">Huella anterior</dt>
            <dd className="break-all font-mono text-xs">{record.huellaAnterior}</dd>
          </div>
        ) : null}
      </dl>

      {record.payload ? (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-fg-subtle">
            Payload enviado
          </h2>
          <pre className="max-h-96 overflow-auto rounded border border-outline-soft bg-surface-muted p-3 text-xs">
            {JSON.stringify(record.payload, null, 2)}
          </pre>
        </section>
      ) : null}

      {record.aeatResponse ? (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-fg-subtle">
            Respuesta AEAT
          </h2>
          <pre className="max-h-96 overflow-auto rounded border border-outline-soft bg-surface-muted p-3 text-xs">
            {JSON.stringify(record.aeatResponse, null, 2)}
          </pre>
        </section>
      ) : null}
    </div>
  );
}
