import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOnboardingStatus } from "@/lib/verifactu/onboarding-status";
import { OnboardingBannerDismissWrapper } from "./OnboardingBannerDismissWrapper";

/**
 * Persistent onboarding banner until issuer, certificate and first AEAT invoice are done.
 */
export async function OnboardingBanner() {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    const status = await getOnboardingStatus(userId);
    if (status.complete) return null;

    const pendingInvoice = await prisma.invoice.findFirst({
      where: { userId, aeatStatus: { not: "SUCCEEDED" } },
      orderBy: { createdAt: "desc" },
      select: { id: true, aeatStatus: true },
    });

    let invoiceStepHref = "/invoices/new";
    let invoiceStepCta = "Crear factura";
    if (!status.firstInvoiceDone && pendingInvoice) {
      invoiceStepHref =
        pendingInvoice.aeatStatus === "NOT_SENT"
          ? `/invoices/${pendingInvoice.id}?send=1`
          : `/invoices/${pendingInvoice.id}`;
      invoiceStepCta =
        pendingInvoice.aeatStatus === "NOT_SENT" ? "Enviar borrador" : "Ver factura";
    }

    const steps = [
      {
        id: "issuer",
        label: "Datos del emisor",
        done: status.issuerProfileDone,
        href: "/settings/verifactu",
        cta: "Configurar",
      },
      {
        id: "cert",
        label: "Certificado AEAT",
        done: status.certificateDone,
        href: "/settings/verifactu",
        cta: "Subir",
      },
      {
        id: "invoice",
        label: "Primera factura enviada",
        done: status.firstInvoiceDone,
        href: invoiceStepHref,
        cta: invoiceStepCta,
      },
    ];

    const completed = steps.filter((s) => s.done).length;
    const next = steps.find((s) => !s.done);
    const pct = Math.round((completed / steps.length) * 100);

    return (
      <OnboardingBannerDismissWrapper>
        <div
          role="status"
          aria-label={`Configuración: ${completed} de ${steps.length} pasos completados`}
          className="border-b border-outline-soft/80 bg-gradient-to-r from-accent/[0.03] via-surface/90 to-accent/[0.01] backdrop-blur-md text-fg font-display shadow-sm py-1.5"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-3 md:flex-row md:items-center md:justify-between pr-8 md:pr-10">
            <div className="flex flex-1 flex-col gap-2.5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
                <span className="font-bold text-fg tracking-tight text-xs bg-accent/10 px-2 py-0.5 rounded-md text-accent border border-accent-outline/25">Setup</span>
                <span className="font-extrabold text-fg text-sm tracking-tight">Completa tu configuración</span>
                <span className="text-xs text-fg-subtle font-medium">
                  {completed} de {steps.length} completados ·{" "}
                  <Link href="/onboarding" className="text-accent hover:text-accent-hover font-bold underline hover:no-underline animate-fade-in-up">
                    Ver guía de pasos
                  </Link>
                </span>
                {next ? (
                  <span className="hidden sm:inline text-xs text-fg-muted font-sans font-medium">
                    Siguiente: <strong className="text-fg font-bold">{next.label}</strong>
                  </span>
                ) : null}
              </div>
              {status.certificateExpiresWithin30Days ? (
                <p className="text-xs font-bold text-warning-muted animate-pulse flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-warning-strong" />
                  Tu certificado caduca en menos de 30 días
                </p>
              ) : null}
              <div className="flex items-center gap-4">
                <div
                  className="progress-track flex-1 h-1.5 bg-surface-muted rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div className="progress-fill h-full rounded-full bg-gradient-to-r from-accent to-accent-hover" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-black text-fg-subtle tracking-tight pr-1">{pct}%</span>
              </div>
              <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-fg-muted font-sans font-semibold">
                {steps.map((s) => (
                  <li key={s.id} className="flex items-center gap-1.5">
                    <span className={`h-4.5 w-4.5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                      s.done 
                        ? "bg-success/20 border-success-outline/40 text-success-emphasis" 
                        : "bg-surface-muted/50 border-outline-soft/85 text-fg-subtle"
                    }`}>
                      {s.done ? (
                        <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-fg-subtle" />
                      )}
                    </span>
                    <span className={s.done ? "line-through text-fg-subtle/70" : "text-fg-muted"}>{s.label}</span>
                  </li>
                ))}
              </ul>
            </div>
            {next ? (
              <Link
                href={next.href}
                className="btn btn-sm btn-accent self-start md:self-center"
              >
                {next.cta}
              </Link>
            ) : null}
          </div>
        </div>
      </OnboardingBannerDismissWrapper>
    );
  } catch {
    return null;
  }
}
