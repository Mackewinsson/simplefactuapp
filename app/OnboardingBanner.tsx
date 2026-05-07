import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ensureVerifactuApiKey } from "@/lib/verifactu/provision";
import { createSimplefactuClient, getSimplefactuBaseUrl } from "@/lib/simplefactu/client";

/**
 * Persistent onboarding banner. Visible until the user completes the three
 * setup steps required to issue invoices through Veri*Factu:
 *
 *   1. Issuer profile (NIF + legal name) saved.
 *   2. AEAT certificate uploaded (and confirmed remotely on the API).
 *   3. At least one invoice successfully registered with AEAT.
 *
 * When all three are done the component returns null. When fewer than three
 * are done it renders an amber warning bar above the main content with a
 * "X / 3" progress indicator and a CTA to the next pending step.
 *
 * Server component on purpose: we already do these reads on /settings and
 * /invoices pages; centralising the logic here keeps the cost low.
 *
 * Failure mode: if anything throws (DB down, API down) the banner is
 * silently hidden. Operators see incidents through the dedicated alerting
 * channels; bothering the user with a "we cannot tell what's missing"
 * banner is worse than no banner.
 */
export async function OnboardingBanner() {
  const { userId } = await auth();
  if (!userId) return null;

  let issuerProfileDone = false;
  let certificateDone = false;
  let firstInvoiceDone = false;

  try {
    const [account, invoiceCount] = await Promise.all([
      prisma.userVerifactuAccount.findUnique({ where: { userId } }),
      prisma.invoice.count({ where: { userId, aeatStatus: "SUCCEEDED" } }),
    ]);

    issuerProfileDone = Boolean(account?.issuerNif?.trim() && account?.issuerLegalName?.trim());
    firstInvoiceDone = invoiceCount > 0;

    // Always probe the API; it is the source of truth for the certificate.
    // The local certificateUploadedAt flag can be stale (e.g. wiped on key
    // rotation while the certificate row in the API tenant remains valid),
    // so we use it only as a fallback when the API is unreachable.
    try {
      const { apiKey } = await ensureVerifactuApiKey(userId);
      const client = createSimplefactuClient({
        baseUrl: getSimplefactuBaseUrl(),
        apiKey,
      });
      const res = await client.getMeCertificate();
      if (res.ok) {
        const j = (await res.json()) as { hasCertificate?: boolean; updatedAt?: string };
        certificateDone = Boolean(j.hasCertificate);

        // Self-heal: backfill certificateUploadedAt from the API's updatedAt
        // when the API confirms a certificate but Prisma lost the timestamp.
        // Idempotent: the next render finds the flag set and skips the write.
        if (certificateDone && j.updatedAt && !account?.certificateUploadedAt) {
          const parsed = new Date(j.updatedAt);
          if (!Number.isNaN(parsed.getTime())) {
            await prisma.userVerifactuAccount.update({
              where: { userId },
              data: { certificateUploadedAt: parsed },
            });
          }
        }
      } else {
        certificateDone = Boolean(account?.certificateUploadedAt);
      }
    } catch {
      certificateDone = Boolean(account?.certificateUploadedAt);
    }
  } catch {
    // DB or auth blip: be quiet, don't spam the UI.
    return null;
  }

  const steps = [
    {
      id: "issuer",
      label: "Datos del emisor",
      done: issuerProfileDone,
      href: "/settings/verifactu",
      cta: "Configurar",
    },
    {
      id: "cert",
      label: "Certificado AEAT",
      done: certificateDone,
      href: "/settings/verifactu",
      cta: "Subir",
    },
    {
      id: "invoice",
      label: "Primera factura enviada",
      done: firstInvoiceDone,
      href: "/invoices/new",
      cta: "Crear factura",
    },
  ];

  const completed = steps.filter((s) => s.done).length;
  if (completed === steps.length) return null;

  const next = steps.find((s) => !s.done);
  const pct = Math.round((completed / steps.length) * 100);

  return (
    <div
      role="status"
      aria-label={`Configuración: ${completed} de ${steps.length} pasos completados`}
      className="border-b border-amber-200 bg-amber-50 text-amber-900"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
            <span className="font-medium">Completa tu configuración</span>
            <span className="text-xs">
              {completed} / {steps.length} pasos
            </span>
            {next ? (
              <span className="text-xs text-amber-700">
                Siguiente: <strong>{next.label}</strong>
              </span>
            ) : null}
          </div>
          <div
            className="h-1 w-full overflow-hidden rounded bg-amber-200"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full bg-amber-500" style={{ width: `${pct}%` }} />
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
            className="self-start rounded border border-amber-400 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-100 md:self-center"
          >
            {next.cta}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
