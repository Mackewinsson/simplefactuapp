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
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-fg">Configura Verifactu</h1>
      <p className="mt-2 text-sm text-fg-muted">
        Cuatro pasos para emitir facturas con registro en AEAT (el de comprobar NIF es opcional). Puedes
        salir y volver cuando quieras; te redirigiremos aquí hasta completar emisor, certificado y primera
        factura.
      </p>

      {status.certificateExpiresWithin30Days && status.certificateNotAfter ? (
        <div
          role="alert"
          className="mt-6 rounded border border-warning-outline bg-warning p-4 text-sm text-warning-foreground"
        >
          <p className="font-medium">Tu certificado caduca pronto</p>
          <p className="mt-1">
            Válido hasta{" "}
            <time dateTime={status.certificateNotAfter}>
              {new Date(status.certificateNotAfter).toLocaleDateString("es")}
            </time>
            . Renueva el PFX en{" "}
            <Link href="/settings/verifactu" className="font-medium underline">
              Ajustes Verifactu
            </Link>{" "}
            para no interrumpir los envíos.
          </p>
        </div>
      ) : null}

      <div
        className="mt-6 h-2 overflow-hidden rounded bg-surface-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-fg-muted">
        {completed} de {status.steps.length} pasos completados
      </p>

      <ol className="mt-8 space-y-4">
        {status.steps.map((step, index) => {
          const link =
            step.id === "vnif"
              ? null
              : stepLinks[step.id as keyof typeof stepLinks];
          return (
            <li
              key={step.id}
              className={`rounded border p-5 ${
                step.done
                  ? "border-outline-soft bg-surface-muted opacity-80"
                  : "border-outline bg-surface"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-medium text-fg-muted">Paso {index + 1}</span>
                  <h2 className="mt-1 text-lg font-medium text-fg">{step.label}</h2>
                  <p className="mt-1 text-sm text-fg-muted">
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
                    <span className="mt-1 inline-block text-xs text-fg-subtle">Opcional</span>
                  ) : null}
                </div>
                <span
                  className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
                    step.done
                      ? "bg-success-muted text-success-emphasis"
                      : "bg-warning-muted text-warning-foreground"
                  }`}
                  aria-hidden
                >
                  {step.done ? "Hecho" : "Pendiente"}
                </span>
              </div>
              {!step.done && step.id === "vnif" ? (
                <OnboardingVnifForm
                  defaultNif={account?.issuerNif ?? ""}
                  defaultNombre={account?.issuerLegalName ?? ""}
                />
              ) : null}
              {!step.done && link ? (
                <Link
                  href={link.href}
                  className="mt-4 inline-block rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
                >
                  {link.cta}
                </Link>
              ) : null}
            </li>
          );
        })}
      </ol>

      <p className="mt-8 text-center text-sm text-fg-muted">
        <Link href="/invoices" className="text-fg-link underline hover:text-fg">
          Ir al listado de facturas
        </Link>{" "}
        (algunas secciones seguirán bloqueadas hasta completar los pasos)
      </p>
    </div>
  );
}
