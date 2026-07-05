import Link from "next/link";

export const dynamic = "force-dynamic";

export default function BillingSuccessPage() {
  return (
    <div className="mx-auto max-w-md">
      <div className="rounded border border-success-outline bg-success p-6 text-center">
        <h1 className="text-xl font-semibold text-success-deep">Suscripción confirmada</h1>
        <p className="mt-2 text-sm text-success-foreground">
          Lemon Squeezy ha procesado el pago. Tu plan Pro se activará en cuanto recibamos el webhook (suele
          ser inmediato).
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/settings/billing" className="btn btn-md btn-cta">
            Ver mi plan
          </Link>
          <Link href="/invoices" className="btn btn-md btn-secondary">
            Ir a facturas
          </Link>
        </div>
      </div>
    </div>
  );
}
