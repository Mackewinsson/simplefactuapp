import Link from "next/link";

export default function BillingCancelPage() {
  return (
    <div className="mx-auto max-w-md">
      <div className="rounded border border-gray-200 bg-white p-6 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Pago no completado</h1>
        <p className="mt-2 text-sm text-gray-700">
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
