import { prisma } from "@/lib/prisma";
import { createSimplefactuClient, getSimplefactuBaseUrl } from "@/lib/simplefactu/client";
import { ensureVerifactuApiKey } from "@/lib/verifactu/provision";

export type OnboardingStep = {
  id: "issuer" | "cert" | "invoice";
  label: string;
  done: boolean;
};

export type OnboardingStatus = {
  complete: boolean;
  issuerProfileDone: boolean;
  certificateDone: boolean;
  firstInvoiceDone: boolean;
  steps: OnboardingStep[];
  certificateNotAfter: string | null;
  certificateExpiresWithin30Days: boolean;
};

export async function getOnboardingStatus(userId: string): Promise<OnboardingStatus> {
  const [account, invoiceCount] = await Promise.all([
    prisma.userVerifactuAccount.findUnique({ where: { userId } }),
    prisma.invoice.count({ where: { userId, aeatStatus: "SUCCEEDED" } }),
  ]);

  const issuerProfileDone = Boolean(
    account?.issuerNif?.trim() && account?.issuerLegalName?.trim()
  );
  const firstInvoiceDone = invoiceCount > 0;

  let certificateDone = Boolean(account?.certificateUploadedAt);
  let certificateNotAfter: string | null = null;
  let certificateExpiresWithin30Days = false;

  try {
    const { apiKey } = await ensureVerifactuApiKey(userId);
    const client = createSimplefactuClient({
      baseUrl: getSimplefactuBaseUrl(),
      apiKey,
    });
    const res = await client.getMeCertificate();
    if (res.ok) {
      const j = (await res.json()) as {
        hasCertificate?: boolean;
        certificate?: {
          notAfter?: string;
          expiresWithin30Days?: boolean;
        };
      };
      certificateDone = Boolean(j.hasCertificate);
      certificateNotAfter = j.certificate?.notAfter ?? null;
      certificateExpiresWithin30Days = Boolean(j.certificate?.expiresWithin30Days);

      if (certificateDone && !account?.certificateUploadedAt) {
        await prisma.userVerifactuAccount.update({
          where: { userId },
          data: { certificateUploadedAt: new Date() },
        });
      }
    }
  } catch {
    // keep local fallback
  }

  const steps: OnboardingStep[] = [
    { id: "issuer", label: "Datos del emisor", done: issuerProfileDone },
    { id: "cert", label: "Certificado AEAT", done: certificateDone },
    { id: "invoice", label: "Primera factura registrada", done: firstInvoiceDone },
  ];

  return {
    complete: steps.every((s) => s.done),
    issuerProfileDone,
    certificateDone,
    firstInvoiceDone,
    steps,
    certificateNotAfter,
    certificateExpiresWithin30Days,
  };
}

/** Paths that stay reachable while onboarding is incomplete. */
export function isOnboardingExemptPath(pathname: string): boolean {
  return (
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/legal") ||
    pathname.startsWith("/admin-access-denied") ||
    pathname === "/sign-in" ||
    pathname === "/sign-up"
  );
}
