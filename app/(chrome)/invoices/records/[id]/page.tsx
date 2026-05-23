import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { fetchInvoiceRecordById } from "@/lib/simplefactu/invoice-records";
import { formatVerifactuActionError } from "@/lib/simplefactu/api-errors";
import {
  invoiceRecordEstadoBadgeVariant,
  invoiceRecordEstadoLabel,
  invoiceRecordTipoBadgeVariant,
  invoiceRecordTipoLabel,
} from "@/lib/simplefactu/invoice-record-labels";
import { statusBadgeClass } from "@/lib/ui/status-badge";

export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("es", {
  dateStyle: "long",
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
          ← Histórico en Hacienda
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
        ← Histórico en Hacienda
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-fg">{record.numSerie}</h1>
      <p className="mt-1 text-sm text-fg-muted">
        Registrado en Hacienda el {dateFormat.format(new Date(record.createdAt))}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className={statusBadgeClass(invoiceRecordTipoBadgeVariant(record.tipo))}>
          {invoiceRecordTipoLabel(record.tipo)}
        </span>
        <span className={statusBadgeClass(invoiceRecordEstadoBadgeVariant(record.estado))}>
          {invoiceRecordEstadoLabel(record.estado)}
        </span>
      </div>

      <dl className="mt-6 grid gap-4 rounded-xl border border-outline-soft bg-surface p-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-fg-muted">Número</dt>
          <dd className="mt-0.5 font-medium font-mono">{record.numSerie}</dd>
        </div>
        <div>
          <dt className="text-fg-muted">Fecha de la factura</dt>
          <dd className="mt-0.5">{record.fecha}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-fg-muted">Código CSV (verificación AEAT)</dt>
          <dd className="mt-0.5 font-mono text-sm">{record.csv ?? "—"}</dd>
          {record.csv ? (
            <p className="mt-1 text-xs text-fg-subtle">
              Es el mismo código que aparece en el PDF de la factura y sirve para comprobar el
              registro en la sede de la AEAT.
            </p>
          ) : null}
        </div>
      </dl>

      <p className="mt-6 text-xs text-fg-subtle">
        Este histórico es una copia de lo que Hacienda ha aceptado. No se puede modificar desde
        aquí; si necesitas corregir algo, emite una factura rectificativa o anula el registro desde
        la factura original.
      </p>
    </div>
  );
}
