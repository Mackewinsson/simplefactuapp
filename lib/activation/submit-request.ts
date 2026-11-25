import "server-only";

import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import type { ActivationRequestKind } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendActivationRequestAdminEmail } from "@/lib/email/activation-notifications";
import { revalidatePath } from "next/cache";

export const activationRequestSchema = z.object({
  companyName: z
    .string()
    .min(2, "El nombre de la empresa debe tener al menos 2 caracteres")
    .max(120),
  nif: z
    .string()
    .min(8, "NIF inválido")
    .max(20)
    .transform((v) => v.trim().toUpperCase()),
  email: z.string().email("Email no válido").max(200),
  message: z.string().max(2000).optional(),
});

export type SubmitActivationResult = {
  ok: boolean;
  error?: string;
  message?: string;
};

export async function createActivationRequestForUser(params: {
  userId: string;
  kind: ActivationRequestKind;
  formData: FormData;
}): Promise<SubmitActivationResult> {
  const parsed = activationRequestSchema.safeParse({
    companyName: params.formData.get("companyName"),
    nif: params.formData.get("nif"),
    email: params.formData.get("email"),
    message: params.formData.get("message") || undefined,
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first?.message ?? "Datos inválidos" };
  }

  const existingPending = await prisma.activationRequest.findFirst({
    where: { userId: params.userId, kind: params.kind, status: "PENDING" },
    select: { id: true },
  });
  if (existingPending) {
    return {
      ok: false,
      error: "Ya tienes una solicitud pendiente. Te avisaremos cuando la revisemos.",
    };
  }

  const user = await currentUser();
  const email =
    parsed.data.email ||
    user?.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ||
    user?.emailAddresses[0]?.emailAddress ||
    "";

  if (!email) {
    return { ok: false, error: "Necesitamos un email de contacto." };
  }

  try {
    await prisma.activationRequest.create({
      data: {
        userId: params.userId,
        email,
        companyName: parsed.data.companyName.trim(),
        nif: parsed.data.nif,
        message: parsed.data.message?.trim() || null,
        kind: params.kind,
        status: "PENDING",
      },
    });

    void sendActivationRequestAdminEmail({
      userId: params.userId,
      email,
      companyName: parsed.data.companyName.trim(),
      nif: parsed.data.nif,
      message: parsed.data.message?.trim() || null,
      kind: params.kind,
    });

    revalidatePath("/admin/requests");
    revalidatePath("/partner/activation");
    revalidatePath("/onboarding");
    revalidatePath("/settings/activation");
    revalidatePath("/invoices");
    revalidatePath("/invoices/new");

    return {
      ok: true,
      message: "Solicitud enviada. Te avisaremos por email cuando la revisemos.",
    };
  } catch {
    return {
      ok: false,
      error: "No hemos podido guardar la solicitud. Inténtalo de nuevo.",
    };
  }
}
