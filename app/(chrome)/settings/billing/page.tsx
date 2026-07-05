import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { APP_DISPLAY_NAME } from "@/lib/branding";
import { BILLING_PLANS, formatPlanPrice } from "@/lib/billing/plans";
import { getSubscriptionByUserId } from "@/lib/billing/subscription-store";
import { ensureVerifactuApiKey } from "@/lib/verifactu/provision";
import { createSimplefactuClient, getSimplefactuBaseUrl } from "@/lib/simplefactu/client";
import { formatVerifactuActionError } from "@/lib/simplefactu/api-errors";
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

function pct(used: number, max: number): number {
  if (!max) return 0;
  return Math.min(100, Math.round((used / max) * 100));
}

export default async function BillingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  if (!isBillingEnabled()) {
    return (
      <div className="mx-auto max-w-md">
        <div className="mb-6">
          <Link href="/invoices" className="text-sm text-fg-muted hover:text-fg">
            ← Volver
          </Link>
        </div>
        <h1 className="mb-3 text-2xl font-semibold">Plan y facturación</h1>
        <div className="rounded border border-info-outline bg-accent-muted p-4 text-sm text-accent-foreground-muted">
          <p className="font-medium">Esta funcionalidad estará disponible próximamente.</p>
          <p className="mt-1 text-info-deep">
            De momento puedes usar {APP_DISPLAY_NAME} sin coste. Te avisaremos por email cuando los planes
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
  let subscription = null;

  try {
    const [{ apiKey }, sub] = await Promise.all([
      ensureVerifactuApiKey(userId),
      getSubscriptionByUserId(userId),
    ]);
    subscription = sub;

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
    fetchError = formatVerifactuActionError(e);
  }

  const proPlan = BILLING_PLANS.pro;
  const enterprisePlan = BILLING_PLANS.enterprise;
  const requestsPct = plan && usage ? pct(usage.requests, plan.maxRequestsPerMonth) : 0;
  const invoicesPct = plan && usage ? pct(usage.invoices, plan.maxInvoicesPerMonth) : 0;
  const isFree = plan?.id === "free";
  const isPro = plan?.id === "pro";
  const isEnterprise = plan?.id === "enterprise";
  const suspended = status === "SUSPENDED";
  const nearLimit = requestsPct >= 80 || invoicesPct >= 80;
  const portalUrl = subscription?.customerPortalUrl ?? null;

  return (
    <div className="space-y-6 font-display animate-fade-in-up">
      <div>
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-fg-subtle hover:text-fg transition-colors group mb-3"
        >
          <span className="transform group-hover:-translate-x-0.5 transition-transform">←</span> Volver a
          facturas
        </Link>
        <h1 className="text-3.5xl font-black tracking-tight text-fg">Plan y facturación</h1>
        <p className="mt-1.5 text-sm text-fg-muted font-sans font-medium">
          Suscripción y pagos seguros a través de Lemon Squeezy (Merchant of Record). Administra tu plan y
          controla tu consumo.
        </p>
      </div>

      {fetchError ? (
        <div
          role="alert"
          className="text-sm text-danger-foreground font-semibold bg-danger/10 p-4 rounded-xl border border-danger-outline/40 backdrop-blur-md flex items-start gap-2.5"
        >
          <div className="text-xs">
            <p className="font-extrabold text-danger-foreground">Error al recuperar tu plan</p>
            <p className="mt-0.5 text-danger-foreground font-medium font-sans">
              {fetchError}. Recarga la página o ponte en contacto con soporte.
            </p>
          </div>
        </div>
      ) : null}

      {suspended ? (
        <div
          role="alert"
          className="text-sm text-warning-foreground font-semibold bg-warning/50 p-5 rounded-2xl border border-warning-outline/65 backdrop-blur-md"
        >
          <p className="font-extrabold text-warning-foreground">Tu cuenta está suspendida</p>
          <p className="mt-1 text-xs text-warning-muted font-sans font-medium">
            No hemos podido cobrar la última factura. Actualiza el método de pago desde el portal de
            Lemon Squeezy para reactivar tu cuenta automáticamente.
          </p>
          {portalUrl ? (
            <a href={portalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-md btn-secondary mt-4">
              Gestionar suscripción
            </a>
          ) : null}
        </div>
      ) : nearLimit ? (
        <div
          role="alert"
          className="text-sm text-warning-foreground font-semibold bg-warning/50 p-5 rounded-2xl border border-warning-outline/65 backdrop-blur-md"
        >
          <p className="font-extrabold text-warning-foreground">Cerca del límite de consumo</p>
          <p className="mt-1 text-xs text-warning-muted font-sans font-medium">
            Has consumido más del 80% del plan <strong>{plan?.name}</strong>. Mejora a Pro si necesitas más
            capacidad.
          </p>
        </div>
      ) : null}

      {plan && usage ? (
        <section className="panel-premium rounded-2xl p-6 border border-outline-soft/80 bg-surface/50 backdrop-blur-sm shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-outline-soft/50">
            <div>
              <span className="text-[10px] font-black tracking-wider uppercase bg-accent/10 text-accent px-2 py-0.5 rounded-full border border-accent-outline/20">
                {status}
              </span>
              <h2 className="text-lg font-black tracking-tight text-fg mt-1">
                Plan actual: <span className="font-bold text-accent font-mono">{plan.name}</span>
              </h2>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-fg">
                {plan.priceCents > 0 ? `${formatPlanPrice(plan.priceCents)} / mes` : "Gratuito"}
              </span>
              <p className="text-[10px] text-fg-subtle font-sans font-semibold uppercase tracking-wider">
                Período: {usage.month}
              </p>
            </div>
          </div>

          {portalUrl && (isPro || isEnterprise) ? (
            <div className="flex flex-wrap gap-3">
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-md btn-secondary"
              >
                Gestionar suscripción en Lemon Squeezy
              </a>
            </div>
          ) : null}

          <dl className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
            <UsageBar label="Peticiones API" used={usage.requests} max={plan.maxRequestsPerMonth} pct={requestsPct} />
            <UsageBar
              label="Facturas registradas Verifactu"
              used={usage.invoices}
              max={plan.maxInvoicesPerMonth}
              pct={invoicesPct}
            />
          </dl>
        </section>
      ) : null}

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-fg">Planes de suscripción</h2>
          <p className="text-sm text-fg-muted font-sans font-medium">
            El plan Pro se contrata online. Enterprise se activa bajo presupuesto.
          </p>
        </div>

        {isFree ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative panel-premium rounded-2xl p-6 border border-outline-soft/85 bg-surface/50 flex flex-col justify-between shadow-sm">
              <div className="absolute inset-x-0 -top-px h-[2.5px] bg-gradient-to-r from-accent/0 via-accent to-accent/0 rounded-t-2xl" />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-black tracking-tight text-fg">Plan PRO</h3>
                  <span className="text-[9px] font-black tracking-wider uppercase bg-accent/15 text-accent px-2.5 py-0.5 rounded-full border border-accent-outline/25">
                    RECOMENDADO
                  </span>
                </div>
                <p className="text-xs text-fg-subtle font-sans font-semibold mb-4 leading-relaxed">
                  Para profesionales independientes y pymes en pleno crecimiento.
                </p>
                <div className="mb-5 flex items-baseline gap-1">
                  <span className="text-3.5xl font-black tracking-tight text-fg">
                    {formatPlanPrice(proPlan.priceCents)}
                  </span>
                  <span className="text-xs text-fg-subtle font-sans font-bold">/ mes (IVA incl. vía MoR)</span>
                </div>
                <ul className="space-y-3 text-xs text-fg-muted font-sans font-medium mb-6">
                  <li>
                    <strong>{proPlan.maxRequestsPerMonth.toLocaleString("es-ES")}</strong> peticiones API / mes
                  </li>
                  <li>
                    <strong>{proPlan.maxInvoicesPerMonth.toLocaleString("es-ES")}</strong> facturas Verifactu /
                    mes
                  </li>
                  <li>Soporte técnico prioritario por email</li>
                </ul>
              </div>
              <UpgradeButton label="Mejorar a Pro" />
            </div>

            <div className="panel-premium rounded-2xl p-6 border border-outline-soft bg-surface/40 flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="text-lg font-black tracking-tight text-fg mb-2">Plan ENTERPRISE</h3>
                <p className="text-xs text-fg-subtle font-sans font-semibold mb-4 leading-relaxed">
                  Para ERPs, gestorías y grandes volúmenes de facturación mensual.
                </p>
                <div className="mb-5 flex items-baseline gap-1">
                  <span className="text-3.5xl font-black tracking-tight text-fg">
                    {formatPlanPrice(enterprisePlan.priceCents)}
                  </span>
                  <span className="text-xs text-fg-subtle font-sans font-bold">/ mes (presupuesto)</span>
                </div>
                <ul className="space-y-3 text-xs text-fg-muted font-sans font-medium mb-6">
                  <li>
                    <strong>{enterprisePlan.maxRequestsPerMonth.toLocaleString("es-ES")}</strong> peticiones API /
                    mes
                  </li>
                  <li>
                    <strong>{enterprisePlan.maxInvoicesPerMonth.toLocaleString("es-ES")}</strong> facturas
                    Verifactu / mes
                  </li>
                  <li>Soporte dedicado y activación manual</li>
                </ul>
              </div>
              <a
                href={`mailto:${enterprisePlan.contactEmail}?subject=${encodeURIComponent("Plan Enterprise Simple*Factu")}`}
                className="btn btn-lg btn-secondary w-full sm:w-auto text-center"
              >
                Contactar ventas
              </a>
            </div>
          </div>
        ) : isPro ? (
          <div className="panel-premium rounded-2xl p-6 border border-outline-soft bg-surface/40 max-w-lg">
            <h3 className="text-sm font-black text-fg mb-1">¿Necesitas más capacidad?</h3>
            <p className="text-xs text-fg-muted font-sans font-medium leading-relaxed mb-4">
              Enterprise se activa bajo presupuesto para gestorías y grandes volúmenes.
            </p>
            <a
              href={`mailto:${enterprisePlan.contactEmail}?subject=${encodeURIComponent("Upgrade Enterprise desde Pro")}`}
              className="btn btn-md btn-secondary"
            >
              Contactar ventas
            </a>
          </div>
        ) : isEnterprise ? (
          <div className="panel-premium rounded-2xl p-6 border border-outline-soft bg-surface/50 max-w-lg">
            <h3 className="text-sm font-black text-fg mb-1">Estás en el plan empresarial más alto</h3>
            <p className="text-xs text-fg-muted font-sans font-medium leading-relaxed">
              Si tu volumen excede las capacidades incluidas, escríbenos para un plan a medida.
            </p>
          </div>
        ) : null}
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
  const tone =
    barPct >= 100
      ? "from-danger-emphasis to-danger-border"
      : barPct >= 80
        ? "from-warning-strong to-warning-emphasis"
        : "from-accent to-accent-hover";
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-xs font-bold text-fg-muted font-display">
        <span>{label}</span>
        <span className="font-mono text-fg font-black">
          {used.toLocaleString("es-ES")} / {max.toLocaleString("es-ES")}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-surface-muted border border-outline-soft/40 shadow-inner"
          role="progressbar"
          aria-valuenow={barPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${barPct}%`}
        >
          <div
            className={`h-full rounded-full bg-gradient-to-r ${tone} shadow-sm transition-all duration-700 ease-out`}
            style={{ width: `${barPct}%` }}
          />
        </div>
        <span className="text-[10px] font-black text-fg-subtle tracking-tight w-8 text-right shrink-0">
          {barPct}%
        </span>
      </div>
    </div>
  );
}
