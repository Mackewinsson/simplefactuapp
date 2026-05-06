import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BillingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  // Stripe replaces {CHECKOUT_SESSION_ID} on the redirect; we just surface it
  // for support if the user needs to reference the session manually.
  const sessionId = sp.session_id ?? null;

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded border border-green-200 bg-green-50 p-6 text-center">
        <h1 className="text-xl font-semibold text-green-900">Suscripción confirmada</h1>
        <p className="mt-2 text-sm text-green-800">
          Stripe ha procesado el pago. Tu plan se activará en cuanto recibamos el webhook
          (suele ser inmediato).
        </p>
        {sessionId ? (
          <p className="mt-4 text-xs text-green-700">
            ID de sesión Stripe: <code className="font-mono">{sessionId}</code>
          </p>
        ) : null}
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/settings/billing" className="btn btn-cta">
            Ver mi plan
          </Link>
          <Link href="/invoices" className="btn">
            Ir a facturas
          </Link>
        </div>
      </div>
    </div>
  );
}
