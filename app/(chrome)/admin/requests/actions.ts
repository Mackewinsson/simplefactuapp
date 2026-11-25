"use server";

import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";
import { requireAdmin } from "@/lib/auth/admin";
import { logAdminAction } from "@/lib/admin-audit";
import { prisma } from "@/lib/prisma";
import {
  sendActivationApprovedEmail,
  sendActivationRejectedEmail,
} from "@/lib/email/activation-notifications";

export type ActivationDecisionState = {
  ok: boolean;
  error?: string;
  message?: string;
} | null;

export async function adminApproveActivationRequestAction(
  _prev: ActivationDecisionState,
  formData: FormData
): Promise<ActivationDecisionState> {
  const { userId: adminId } = await requireAdmin();
  const requestId = formData.get("requestId")?.toString()?.trim();
  if (!requestId) return { ok: false, error: "Falta requestId" };

  const request = await prisma.activationRequest.findUnique({ where: { id: requestId } });
  if (!request) return { ok: false, error: "Solicitud no encontrada." };
  if (request.status !== "PENDING") {
    return { ok: false, error: "Esta solicitud ya fue decidida." };
  }

  try {
    if (request.kind === "INTEGRATOR") {
      const api = await clerkClient();
      const user = await api.users.getUser(request.userId);
      const currentMeta = (user.publicMetadata ?? {}) as Record<string, unknown>;

      await api.users.updateUser(request.userId, {
        publicMetadata: {
          ...currentMeta,
          accountType: "integrator",
          role: "partner",
        },
      });
    }

    await prisma.activationRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        decidedAt: new Date(),
        decidedBy: adminId,
        decisionNote: null,
      },
    });

    await logAdminAction({
      userId: adminId,
      action: "activation.approve",
      target: request.userId,
      metadata: {
        requestId,
        companyName: request.companyName,
        nif: request.nif,
        kind: request.kind,
      },
    });

    void sendActivationApprovedEmail({
      to: request.email,
      companyName: request.companyName,
      kind: request.kind,
    });

    revalidatePath("/admin/requests");
    revalidatePath("/partner/activation");
    revalidatePath("/settings/activation");
    revalidatePath("/onboarding");
    revalidatePath("/invoices");

    const msg =
      request.kind === "INTEGRATOR"
        ? `Aprobado: ${request.companyName} (rol partner asignado).`
        : `Aprobado: ${request.companyName} (envío de facturas activado).`;
    return { ok: true, message: msg };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error al aprobar";
    return { ok: false, error: msg };
  }
}

export async function adminRejectActivationRequestAction(
  _prev: ActivationDecisionState,
  formData: FormData
): Promise<ActivationDecisionState> {
  const { userId: adminId } = await requireAdmin();
  const requestId = formData.get("requestId")?.toString()?.trim();
  const decisionNote = formData.get("decisionNote")?.toString()?.trim() || null;
  if (!requestId) return { ok: false, error: "Falta requestId" };

  const request = await prisma.activationRequest.findUnique({ where: { id: requestId } });
  if (!request) return { ok: false, error: "Solicitud no encontrada." };
  if (request.status !== "PENDING") {
    return { ok: false, error: "Esta solicitud ya fue decidida." };
  }

  try {
    await prisma.activationRequest.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
        decidedAt: new Date(),
        decidedBy: adminId,
        decisionNote,
      },
    });

    await logAdminAction({
      userId: adminId,
      action: "activation.reject",
      target: request.userId,
      metadata: {
        requestId,
        companyName: request.companyName,
        decisionNote,
        kind: request.kind,
      },
    });

    void sendActivationRejectedEmail({
      to: request.email,
      companyName: request.companyName,
      note: decisionNote,
      kind: request.kind,
    });

    revalidatePath("/admin/requests");
    revalidatePath("/partner/activation");
    revalidatePath("/settings/activation");
    revalidatePath("/onboarding");
    return { ok: true, message: `Rechazada: ${request.companyName}.` };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error al rechazar";
    return { ok: false, error: msg };
  }
}
