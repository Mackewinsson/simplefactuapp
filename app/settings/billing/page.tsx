import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ensureVerifactuApiKey } from "@/lib/verifactu/provision";
import { createSimplefactuClient, getSimplefactuBaseUrl } from "@/lib/simplefactu/client";
import { isBillingEnabled } from "@/lib/billing/feature";
import { UpgradeButton } from "./UpgradeButton";

export const dynamic = "force-dynamic";

type PlanResponse = {
  success: boolean;
  plan: {
    id: string;
    name: string;
    maxRequestsPerMonth: number;
    maxInvoicesPerMonth: number;
    priceCents: number;
  };
  usage: {
    requests: number;
    invoices: number;
    month: string;
  };
  status: string;
};

function formatEuros(cents: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

function pct(used: number, max: number): number {
  if (!max) return 0;
  return Math.min(100, Math.round((used / max) * 100));
}

export default async function BillingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Billing feature flag: when off, render a "coming soon" placeholder
  // rather than the full upgrade UI. Hides the API call entirely so the
  // page also works for deploys without the simplefactu /me/upgrade path
  // wired (it would 503 anyway).
  if (!isBillingEnabled()) {
    return (
      <div className="mx-auto max-w-md">
        <div className="mb-6">
          <Link href="/invoices" className="text-sm text-gray-600 hover:text-gray-900">
            ← Volver
          </Link>
        </div>
        <h1 className="mb-3 text-2xl font-semibold">Plan y facturación</h1>
        <div className="rounded border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <p className="font-medium">Esta funcionalidad estará disponible próximamente.</p>
          <p className="mt-1 text-blue-800">
            De momento puedes usar SimpleFactu sin coste. Te avisaremos por email cuando los planes
            de pago estén activos.
          </p>
        </div>
      </div>
    );
  }

  let plan: PlanResponse["plan"] | null = null;
  let usage: PlanResponse["usage"] | null = null;
  let status = "ACTIVE";
  let fetchError: string | null = null;

  try {
    const { apiKey } = await ensureVerifactuApiKey(userId);
    const client = createSimplefactuClient({
      baseUrl: getSimplefactuBaseUrl(),
      apiKey,
    });
    const res = await client.getMePlan();
    if (res.ok) {
      const body = (await res.json()) as PlanResponse;
      plan = body.plan;
      usage = body.usage;
      status = body.status;
    } else {
      fetchError = `HTTP ${res.status}`;
    }
  } catch (e) {
    fetchError = e instanceof Error ? e.message : "Error desconocido";
  }

  const requestsPct = plan && usage ? pct(usage.requests, plan.maxRequestsPerMonth) : 0;
  const invoicesPct = plan && usage ? pct(usage.invoices, plan.maxInvoicesPerMonth) : 0;
  const isFree = plan?.id === "free";
  const isPro = plan?.id === "pro";
  const suspended = status === "SUSPENDED";
  const nearLimit = requestsPct >= 80 || invoicesPct >= 80;

  return (
    <div>
      <div className="mb-6">
        <Link href="/invoices" className="text-sm text-gray-600 hover:text-gray-900">
          ← Volver
        </Link>
      </div>

      <h1 className="mb-2 text-2xl font-semibold">Plan y facturación</h1>
      <p className="mb-8 text-sm text-gray-600">
        Suscripción gestionada por Stripe. La factura mensual llega por email al medio
        registrado en Stripe.
      </p>

      {fetchError ? (
        <div
          role="alert"
          className="mb-6 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          No se pudo recuperar tu plan ({fetchError}). Recarga la página o avisa a soporte.
        </div>
      ) : null}

      {suspended ? (
        <div
          role="alert"
          className="mb-6 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"
        >
          <p className="font-medium">Tu cuenta está suspendida.</p>
          <p>
            Probablemente Stripe no ha podido cobrar la última factura. Actualiza el método
            de pago desde el portal de cliente y la cuenta se reactiva automáticamente.
          </p>
        </div>
      ) : nearLimit ? (
        <div
          role="alert"
          className="mb-6 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"
        >
          <p className="font-medium">Cerca del límite mensual.</p>
          <p>
            Has consumido más del 80% del plan{" "}
            <span className="font-mono">{plan?.name}</span>. Considera mejorar para evitar que
            las próximas facturas reciban un 402.
          </p>
        </div>
      ) : null}

      {plan && usage ? (
        <section className="mb-8 rounded border border-gray-200 bg-white p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold">
              Plan actual: <span className="font-mono">{plan.name}</span>
            </h2>
            <span className="text-sm text-gray-600">
              {plan.priceCents > 0 ? `${formatEuros(plan.priceCents)} / mes` : "Gratuito"}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">Mes {usage.month}</p>

          <dl className="mt-4 space-y-3">
            <UsageBar
              label="Peticiones API"
              used={usage.requests}
              max={plan.maxRequestsPerMonth}
              pct={requestsPct}
            />
            <UsageBar
              label="Facturas registradas"
              used={usage.invoices}
              max={plan.maxInvoicesPerMonth}
              pct={invoicesPct}
            />
          </dl>
        </section>
      ) : null}

      <section className="rounded border border-gray-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Mejorar plan</h2>
        <p className="mt-1 text-sm text-gray-600">
          Pagas mensualmente, sin permanencia. Puedes cancelar desde el portal de Stripe en
          cualquier momento.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {isFree ? (
            <>
              <UpgradeButton planId="pro" label="Mejorar a Pro" />
              <UpgradeButton planId="enterprise" label="Mejorar a Enterprise" variant="secondary" />
            </>
          ) : isPro ? (
            <UpgradeButton planId="enterprise" label="Mejorar a Enterprise" />
          ) : (
            <p className="text-sm text-gray-600">
              Estás en el plan más alto. Si necesitas más capacidad, escríbenos.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function UsageBar({
  label,
  used,
  max,
  pct: barPct,
}: {
  label: string;
  used: number;
  max: number;
  pct: number;
}) {
  const tone = barPct >= 100 ? "bg-red-500" : barPct >= 80 ? "bg-amber-500" : "bg-green-500";
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <dt className="text-gray-700">{label}</dt>
        <dd className="font-mono text-xs text-gray-700">
          {used.toLocaleString("es-ES")} / {max.toLocaleString("es-ES")}
        </dd>
      </div>
      <div
        className="mt-1 h-2 w-full overflow-hidden rounded bg-gray-200"
        role="progressbar"
        aria-valuenow={barPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${barPct}%`}
      >
        <div className={`h-full ${tone}`} style={{ width: `${barPct}%` }} />
      </div>
    </div>
  );
}
