import Link from "next/link";

export default function BillingCancelPage() {
  return (
    <div className="mx-auto max-w-md">
      <div className="rounded border border-outline-soft bg-surface p-6 text-center">
        <h1 className="text-xl font-semibold text-fg">Pago no completado</h1>
        <p className="mt-2 text-sm text-fg-muted">
          Has cancelado el proceso de pago. No se ha cobrado nada y tu plan sigue como estaba.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/settings/billing" className="btn btn-cta">
            Volver a planes
          </Link>
          <Link href="/invoices" className="btn">
            Ir a facturas
          </Link>
        </div>
      </div>
    </div>
  );
}
