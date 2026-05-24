import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOnboardingStatus } from "@/lib/verifactu/onboarding-status";
import { OnboardingVnifForm } from "./OnboardingVnifForm";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const status = await getOnboardingStatus(userId);
  const account = await prisma.userVerifactuAccount.findUnique({
    where: { userId },
    select: { issuerNif: true, issuerLegalName: true },
  });

  if (status.complete) {
    redirect("/invoices");
  }

  const pendingInvoice = await prisma.invoice.findFirst({
    where: { userId, aeatStatus: { not: "SUCCEEDED" } },
    orderBy: { createdAt: "desc" },
    select: { id: true, aeatStatus: true },
  });

  let invoiceHref = "/invoices/new";
  let invoiceCta = "Crear factura";
  if (!status.firstInvoiceDone && pendingInvoice) {
    invoiceHref =
      pendingInvoice.aeatStatus === "NOT_SENT"
        ? `/invoices/${pendingInvoice.id}?send=1`
        : `/invoices/${pendingInvoice.id}`;
    invoiceCta =
      pendingInvoice.aeatStatus === "NOT_SENT" ? "Enviar borrador" : "Ver factura";
  }

  const stepLinks = {
    issuer: { href: "/settings/verifactu", cta: "Configurar emisor" },
    cert: { href: "/settings/verifactu", cta: "Subir certificado" },
    invoice: { href: invoiceHref, cta: invoiceCta },
  } as const;

  const completed = status.steps.filter((s) => s.done).length;
  const pct = Math.round((completed / status.steps.length) * 100);

  return (
    <div className="mx-auto max-w-2xl font-display animate-fade-in-up space-y-8">
      <div>
        <h1 className="text-3.5xl font-black tracking-tight bg-gradient-to-r from-fg via-fg to-accent bg-clip-text text-transparent font-display">
          Configura Verifactu
        </h1>
        <p className="mt-2.5 text-sm text-fg-muted leading-relaxed font-sans font-medium">
          Cuatro pasos para emitir facturas con registro en AEAT. Puedes
          salir y volver cuando quieras; te redirigiremos aquí hasta completar el emisor, certificado y la primera
          factura.
        </p>
      </div>

      {status.certificateExpiresWithin30Days && status.certificateNotAfter ? (
        <div role="alert" className="alert-warning rounded-2xl border border-warning-outline/60 bg-warning/50 p-5 shadow-md backdrop-blur-md animate-pulse flex items-start gap-3.5">
          <svg className="h-5 w-5 text-warning-muted shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="text-sm">
            <p className="font-extrabold text-warning-foreground">Tu certificado caduca pronto</p>
            <p className="mt-1 text-xs text-warning-muted font-sans font-medium">
              Válido hasta{" "}
              <time dateTime={status.certificateNotAfter} className="font-bold">
                {new Date(status.certificateNotAfter).toLocaleDateString("es")}
              </time>
              . Renueva el PFX en{" "}
              <Link href="/settings/verifactu" className="font-bold underline hover:text-warning-deeper text-warning-deep">
                Ajustes Verifactu
              </Link>{" "}
              para no interrumpir los envíos.
            </p>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-outline-soft/80 bg-surface/40 backdrop-blur-xl p-5 shadow-sm">
        <div className="flex justify-between items-baseline text-[11px] font-black text-fg-subtle uppercase tracking-wider mb-2.5">
          <span>Progreso de configuración</span>
          <span className="text-fg font-black">{completed} de {status.steps.length} pasos</span>
        </div>
        <div
          className="progress-track h-2.5 bg-surface-muted/65 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div 
            className="progress-fill h-full rounded-full bg-gradient-to-r from-accent to-accent-hover shadow-sm transition-all duration-700 ease-out" 
            style={{ width: `${pct}%` }} 
          />
        </div>
      </div>

      <ol className="space-y-4">
        {status.steps.map((step, index) => {
          const link =
            step.id === "vnif"
              ? null
              : stepLinks[step.id as keyof typeof stepLinks];
          return (
            <li
              key={step.id}
              className={`rounded-2xl p-6 transition-all duration-300 border ${
                step.done
                  ? "border-success-outline/40 bg-success/20 shadow-sm backdrop-blur-md"
                  : "panel-premium shadow-sm"
              }`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm transition-all duration-300 ${
                    step.done
                      ? "bg-success-emphasis text-white scale-105"
                      : "bg-surface-muted/80 text-fg-muted border border-outline-soft/85"
                  }`}
                  aria-hidden
                >
                  {step.done ? (
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-base font-bold text-fg tracking-tight">{step.label}</h2>
                    <span
                      className={`shrink-0 text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full ${
                        step.done 
                          ? "text-success-foreground bg-success-outline/30 border border-success-outline/40" 
                          : "text-fg-subtle bg-surface-muted border border-outline-soft/60"
                      }`}
                      aria-hidden
                    >
                      {step.done ? "Hecho" : "Pendiente"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-fg-muted leading-relaxed font-sans font-medium">
                    {step.id === "issuer" &&
                      "NIF y razón social del obligado emisión, alineados con tu certificado."}
                    {step.id === "vnif" &&
                      "Confirma con AEAT que el nombre coincide con el NIF antes de subir el certificado."}
                    {step.id === "cert" &&
                      "Certificado digital .pfx para firmar el envío SOAP a AEAT (solo en servidor)."}
                    {step.id === "invoice" &&
                      "Al menos una factura con estado Correcto en AEAT (envío Verifactu)."}
                  </p>
                  {step.optional ? (
                    <span className="mt-2.5 inline-block rounded-md bg-surface-muted/65 px-2 py-0.5 text-[10px] font-bold text-fg-subtle border border-outline-soft/40">
                      Opcional
                    </span>
                  ) : null}
                </div>
              </div>
              {!step.done && step.id === "vnif" ? (
                <div className="mt-5 border-t border-outline-soft/40 pt-5">
                  <OnboardingVnifForm
                    defaultNif={account?.issuerNif ?? ""}
                    defaultNombre={account?.issuerLegalName ?? ""}
                  />
                </div>
              ) : null}
              {!step.done && link ? (
                <div className="pl-13 pt-1">
                  <Link
                    href={link.href}
                    className="btn btn-lg btn-accent mt-4 inline-block"
                  >
                    {link.cta}
                  </Link>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="pt-4 border-t border-outline-soft/60 text-center">
        <p className="text-sm font-semibold text-fg-muted font-display flex flex-col sm:flex-row items-center justify-center gap-2">
          <Link href="/invoices" className="text-accent underline hover:no-underline font-bold">
            Ir al listado de facturas
          </Link>{" "}
          <span className="text-fg-subtle text-xs font-medium">
            (algunas secciones seguirán bloqueadas hasta completar los pasos)
          </span>
        </p>
      </div>
    </div>
  );
}
