import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { APP_DISPLAY_NAME } from "@/lib/branding";
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
    fetchError = formatVerifactuActionError(e);
  }

  const requestsPct = plan && usage ? pct(usage.requests, plan.maxRequestsPerMonth) : 0;
  const invoicesPct = plan && usage ? pct(usage.invoices, plan.maxInvoicesPerMonth) : 0;
  const isFree = plan?.id === "free";
  const isPro = plan?.id === "pro";
  const suspended = status === "SUSPENDED";
  const nearLimit = requestsPct >= 80 || invoicesPct >= 80;

  return (
    <div className="space-y-6 font-display animate-fade-in-up">
      <div>
        <Link href="/invoices" className="inline-flex items-center gap-1.5 text-xs font-bold text-fg-subtle hover:text-fg transition-colors group mb-3">
          <span className="transform group-hover:-translate-x-0.5 transition-transform">←</span> Volver a facturas
        </Link>
        <h1 className="text-3.5xl font-black tracking-tight text-fg">Plan y facturación</h1>
        <p className="mt-1.5 text-sm text-fg-muted font-sans font-medium">
          Suscripción y pagos seguros a través de Stripe. Administra tu plan, descárgate facturas y controla tu consumo.
        </p>
      </div>

      {fetchError ? (
        <div role="alert" className="text-sm text-danger-foreground font-semibold bg-danger/10 p-4 rounded-xl border border-danger-outline/40 backdrop-blur-md flex items-start gap-2.5">
          <svg className="h-5 w-5 text-danger-emphasis shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="text-xs">
            <p className="font-extrabold text-danger-foreground">Error al recuperar tu plan</p>
            <p className="mt-0.5 text-danger-foreground font-medium font-sans">{fetchError}. Recarga la página o ponte en contacto con soporte.</p>
          </div>
        </div>
      ) : null}

      {suspended ? (
        <div role="alert" className="text-sm text-warning-foreground font-semibold bg-warning/50 p-5 rounded-2xl border border-warning-outline/65 backdrop-blur-md flex items-start gap-3.5">
          <svg className="h-5 w-5 text-warning-muted shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-extrabold text-warning-foreground">Tu cuenta está suspendida</p>
            <p className="mt-1 text-xs text-warning-muted font-sans font-medium">
              Probablemente Stripe no ha podido cobrar la última factura. Actualiza el método de pago desde el portal de Stripe para reactivar tu cuenta automáticamente.
            </p>
          </div>
        </div>
      ) : nearLimit ? (
        <div role="alert" className="text-sm text-warning-foreground font-semibold bg-warning/50 p-5 rounded-2xl border border-warning-outline/65 backdrop-blur-md flex items-start gap-3.5 animate-pulse">
          <svg className="h-5 w-5 text-warning-muted shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-extrabold text-warning-foreground">Cerca del límite de consumo</p>
            <p className="mt-1 text-xs text-warning-muted font-sans font-medium">
              Has consumido más del 80% del plan <strong className="text-warning-foreground font-bold">{plan?.name}</strong>. Te recomendamos mejorar de plan para evitar que futuros envíos se detengan.
            </p>
          </div>
        </div>
      ) : null}

      {plan && usage ? (
        <section className="panel-premium rounded-2xl p-6 border border-outline-soft/80 bg-surface/50 backdrop-blur-sm shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-outline-soft/50">
            <div>
              <span className="text-[10px] font-black tracking-wider uppercase bg-accent/10 text-accent px-2 py-0.5 rounded-full border border-accent-outline/20">
                ACTIVO
              </span>
              <h2 className="text-lg font-black tracking-tight text-fg mt-1">
                Plan actual: <span className="font-bold text-accent font-mono">{plan.name}</span>
              </h2>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-fg">
                {plan.priceCents > 0 ? `${formatEuros(plan.priceCents)} / mes` : "Gratuito"}
              </span>
              <p className="text-[10px] text-fg-subtle font-sans font-semibold uppercase tracking-wider">Período: {usage.month}</p>
            </div>
          </div>

          <dl className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
            <UsageBar
              label="Peticiones API"
              used={usage.requests}
              max={plan.maxRequestsPerMonth}
              pct={requestsPct}
            />
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
            Elige el volumen que mejor se adapte a tu operativa. Sin compromisos de permanencia.
          </p>
        </div>

        {isFree ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plan Pro Card */}
            <div className="relative panel-premium rounded-2xl p-6 border border-outline-soft/85 bg-surface/50 flex flex-col justify-between transition-all hover:border-accent-outline/40 hover:-translate-y-[1px] shadow-sm">
              <div className="absolute inset-x-0 -top-px h-[2.5px] bg-gradient-to-r from-accent/0 via-accent to-accent/0 rounded-t-2xl animate-pulse" />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-black tracking-tight text-fg">Plan PRO</h3>
                  <span className="text-[9px] font-black tracking-wider uppercase bg-accent/15 text-accent px-2.5 py-0.5 rounded-full border border-accent-outline/25">RECOMENDADO</span>
                </div>
                <p className="text-xs text-fg-subtle font-sans font-semibold mb-4 leading-relaxed">Para profesionales independientes y pymes en pleno crecimiento.</p>
                <div className="mb-5 flex items-baseline gap-1">
                  <span className="text-3.5xl font-black tracking-tight text-fg">99€</span>
                  <span className="text-xs text-fg-subtle font-sans font-bold">/ mes + IVA</span>
                </div>
                <ul className="space-y-3 text-xs text-fg-muted font-sans font-medium mb-6">
                  <li className="flex items-center gap-2">
                    <svg className="h-4.5 w-4.5 text-success-emphasis shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span><strong>10.000</strong> peticiones API / mes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4.5 w-4.5 text-success-emphasis shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span><strong>5.000</strong> facturas Verifactu / mes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4.5 w-4.5 text-success-emphasis shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Soporte técnico prioritario por email</span>
                  </li>
                </ul>
              </div>
              <div className="pt-2">
                <UpgradeButton planId="pro" label="Mejorar a Pro" />
              </div>
            </div>

            {/* Plan Enterprise Card */}
            <div className="panel-premium rounded-2xl p-6 border border-outline-soft bg-surface/40 flex flex-col justify-between transition-all hover:border-outline/50 hover:-translate-y-[1px] shadow-sm">
              <div>
                <h3 className="text-lg font-black tracking-tight text-fg mb-2">Plan ENTERPRISE</h3>
                <p className="text-xs text-fg-subtle font-sans font-semibold mb-4 leading-relaxed">Para ERPs, gestorías y grandes volúmenes de facturación mensual.</p>
                <div className="mb-5 flex items-baseline gap-1">
                  <span className="text-3.5xl font-black tracking-tight text-fg">999€</span>
                  <span className="text-xs text-fg-subtle font-sans font-bold">/ mes + IVA</span>
                </div>
                <ul className="space-y-3 text-xs text-fg-muted font-sans font-medium mb-6">
                  <li className="flex items-center gap-2">
                    <svg className="h-4.5 w-4.5 text-success-emphasis shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span><strong>100.000</strong> peticiones API / mes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4.5 w-4.5 text-success-emphasis shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span><strong>50.000</strong> facturas Verifactu / mes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4.5 w-4.5 text-success-emphasis shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Soporte dedicado con canal preferente 24/7</span>
                  </li>
                </ul>
              </div>
              <div className="pt-2">
                <UpgradeButton planId="enterprise" label="Mejorar a Enterprise" variant="secondary" />
              </div>
            </div>
          </div>
        ) : isPro ? (
          <div className="max-w-md">
            <div className="panel-premium rounded-2xl p-6 border border-outline-soft bg-surface/40 flex flex-col justify-between transition-all hover:border-outline/50 shadow-sm">
              <div>
                <h3 className="text-lg font-black tracking-tight text-fg mb-2">Plan ENTERPRISE</h3>
                <p className="text-xs text-fg-subtle font-sans font-semibold mb-4 leading-relaxed">¿Necesitas capacidad para toda tu red? Sube de escala al plan empresarial.</p>
                <div className="mb-5 flex items-baseline gap-1">
                  <span className="text-3.5xl font-black tracking-tight text-fg">999€</span>
                  <span className="text-xs text-fg-subtle font-sans font-bold">/ mes + IVA</span>
                </div>
                <ul className="space-y-3 text-xs text-fg-muted font-sans font-medium mb-6">
                  <li className="flex items-center gap-2">
                    <svg className="h-4.5 w-4.5 text-success-emphasis shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span><strong>100.000</strong> peticiones API / mes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4.5 w-4.5 text-success-emphasis shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span><strong>50.000</strong> facturas Verifactu / mes</span>
                  </li>
                </ul>
              </div>
              <div className="pt-2">
                <UpgradeButton planId="enterprise" label="Mejorar a Enterprise" />
              </div>
            </div>
          </div>
        ) : (
          <div className="panel-premium rounded-2xl p-6 border border-outline-soft bg-surface/50 text-left backdrop-blur-sm max-w-lg">
            <h3 className="text-sm font-black text-fg mb-1">¡Estás en el plan empresarial más alto!</h3>
            <p className="text-xs text-fg-muted font-sans font-medium leading-relaxed">
              Si tu volumen de operaciones excede las 100.000 llamadas API al mes, escríbenos directamente a soporte para diseñar un plan a medida adaptado a las necesidades de tu infraestructura.
            </p>
          </div>
        )}
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
  const tone = barPct >= 100 ? "from-danger-emphasis to-danger-border" : barPct >= 80 ? "from-warning-strong to-warning-emphasis" : "from-accent to-accent-hover";
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
          <div className={`h-full rounded-full bg-gradient-to-r ${tone} shadow-sm transition-all duration-700 ease-out`} style={{ width: `${barPct}%` }} />
        </div>
        <span className="text-[10px] font-black text-fg-subtle tracking-tight w-8 text-right shrink-0">{barPct}%</span>
      </div>
    </div>
  );
}
