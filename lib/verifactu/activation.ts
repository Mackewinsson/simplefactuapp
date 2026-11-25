import "server-only";

import type { ActivationRequest, ActivationRequestKind } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isSandboxAutoApproveIntegrators } from "@/lib/auth/account-type";

/**
 * QA / Preview: skip activation gate so local and sandbox can send invoices.
 * Reuses SANDBOX_AUTO_APPROVE_INTEGRATORS or dedicated SANDBOX_AUTO_APPROVE_ACTIVATION.
 */
export function isSandboxAutoApproveActivation(): boolean {
  if (process.env.SANDBOX_AUTO_APPROVE_ACTIVATION === "true") return true;
  return isSandboxAutoApproveIntegrators();
}

export async function getLatestActivationRequest(
  userId: string,
  kind?: ActivationRequestKind
): Promise<ActivationRequest | null> {
  return prisma.activationRequest.findFirst({
    where: {
      userId,
      ...(kind ? { kind } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

/** Onboarding step "activation" done when request is PENDING or APPROVED. */
export async function hasSubmittedAutonomoActivation(userId: string): Promise<boolean> {
  if (isSandboxAutoApproveActivation()) return true;

  const latest = await getLatestActivationRequest(userId, "AUTONOMO");
  return latest?.status === "PENDING" || latest?.status === "APPROVED";
}

/**
 * Hard gate for AEAT send: needs APPROVED autónomo request (or sandbox auto-approve).
 */
export async function isAutonomoProductionActivated(userId: string): Promise<boolean> {
  if (isSandboxAutoApproveActivation()) return true;

  const latest = await getLatestActivationRequest(userId, "AUTONOMO");
  return latest?.status === "APPROVED";
}
