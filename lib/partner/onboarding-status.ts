import "server-only";

import {
  listPartnerJobs,
  listPartnerSubtenants,
  type PartnerSubtenant,
} from "@/lib/simplefactu/partner-server";

export type PartnerOnboardingStepId = "subtenant" | "cert" | "apiKey" | "activate" | "invoice";

export type PartnerOnboardingStep = {
  id: PartnerOnboardingStepId;
  label: string;
  description: string;
  done: boolean;
};

export type PartnerOnboardingStatus = {
  complete: boolean;
  hasSubtenant: boolean;
  hasCertificate: boolean;
  /** True when the primary child is ACTIVE (partner pressed "Activar"). */
  isActive: boolean;
  /** True once a child has a SUCCEEDED AEAT job (implies an API key was used). */
  firstInvoiceDone: boolean;
  /** Server cannot list child API keys; treat as done when invoice succeeded. */
  apiKeyDone: boolean;
  steps: PartnerOnboardingStep[];
  /** First / primary child to drive cert + key + curl steps. */
  primaryChild: PartnerSubtenant | null;
  subtenants: PartnerSubtenant[];
  lastJobStatus: string | null;
  partnerId: string;
};

/**
 * Derives integrator onboarding progress from partner sub-tenants + jobs.
 * No Prisma / no API schema changes.
 */
export async function getPartnerOnboardingStatus(
  userId: string
): Promise<PartnerOnboardingStatus> {
  const partnerId = `rp_${userId}`;
  const subtenants = await listPartnerSubtenants(userId);
  const primaryChild = subtenants[0] ?? null;
  const hasSubtenant = subtenants.length > 0;
  const hasCertificate = Boolean(primaryChild?.has_certificate);
  const isActive = primaryChild?.status === "ACTIVE";

  let firstInvoiceDone = false;
  let lastJobStatus: string | null = null;

  if (primaryChild) {
    try {
      const { jobs } = await listPartnerJobs(userId, primaryChild.id);
      const succeeded = jobs.find((j) => String(j.status ?? "") === "SUCCEEDED");
      firstInvoiceDone = Boolean(succeeded);
      const latest = jobs[0];
      if (latest) lastJobStatus = String(latest.status ?? "") || null;
    } catch {
      // Jobs endpoint may fail transiently; treat as no invoice yet.
    }
  }

  // Without a list-keys endpoint, a SUCCEEDED job is the durable proof a key exists/was used.
  const apiKeyDone = firstInvoiceDone;

  const steps: PartnerOnboardingStep[] = [
    {
      id: "subtenant",
      label: "Alta del primer NIF emisor",
      description:
        "¿Emites tus propias facturas? Usa tu NIF. ¿Gestionas clientes? Da de alta al primero.",
      done: hasSubtenant,
    },
    {
      id: "cert",
      label: "Certificado digital (PFX)",
      description: "Sube el .pfx/.p12 del emisor — obligatorio para enviar a AEAT.",
      done: hasCertificate,
    },
    {
      id: "apiKey",
      label: "API key del emisor",
      description: "Genera la clave del autónomo (no la de gestoría) para POST /send-invoice.",
      done: apiKeyDone,
    },
    {
      id: "activate",
      label: "Activar el NIF emisor",
      description:
        "Con certificado y API key listos, activa el NIF para permitir envíos a AEAT.",
      done: isActive,
    },
    {
      id: "invoice",
      label: "Primera factura de prueba",
      description: "Envía un alta de prueba y espera SUCCEEDED en el job AEAT.",
      done: firstInvoiceDone,
    },
  ];

  const complete = hasSubtenant && hasCertificate && isActive && firstInvoiceDone;

  return {
    complete,
    hasSubtenant,
    hasCertificate,
    isActive,
    firstInvoiceDone,
    apiKeyDone,
    steps,
    primaryChild,
    subtenants,
    lastJobStatus,
    partnerId,
  };
}
