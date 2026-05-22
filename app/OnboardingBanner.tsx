import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOnboardingStatus } from "@/lib/verifactu/onboarding-status";

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
      <div
        role="status"
        aria-label={`Configuración: ${completed} de ${steps.length} pasos completados`}
        className="border-b border-outline-soft bg-surface-muted text-fg"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
              <span className="font-medium">Completa tu configuración</span>
              <span className="text-xs text-fg-muted">
                {completed} / {steps.length} pasos ·{" "}
                <Link href="/onboarding" className="text-fg-link underline hover:no-underline">
                  Ver guía
                </Link>
              </span>
              {next ? (
                <span className="text-xs text-fg-muted">
                  Siguiente: <strong className="text-fg">{next.label}</strong>
                </span>
              ) : null}
            </div>
            {status.certificateExpiresWithin30Days ? (
              <p className="text-xs font-medium text-warning-muted">
                Tu certificado caduca en menos de 30 días
              </p>
            ) : null}
            <div
              className="progress-track h-1"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              {steps.map((s) => (
                <li key={s.id} className="flex items-center gap-1">
                  <span aria-hidden>{s.done ? "✓" : "•"}</span>
                  <span className={s.done ? "line-through opacity-70" : ""}>{s.label}</span>
                </li>
              ))}
            </ul>
          </div>
          {next ? (
            <Link
              href={next.href}
              className="btn btn-sm btn-secondary self-start md:self-center"
            >
              {next.cta}
            </Link>
          ) : null}
        </div>
      </div>
    );
  } catch {
    return null;
  }
}
