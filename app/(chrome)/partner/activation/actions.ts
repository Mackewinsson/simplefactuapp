"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserAccountType, isPendingIntegrator } from "@/lib/auth/account-type";
import { sendActivationRequestAdminEmail } from "@/lib/email/activation-notifications";
import { revalidatePath } from "next/cache";

const schema = z.object({
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

export type ActivationRequestState = {
  ok: boolean;
  error?: string;
  message?: string;
} | null;

export async function submitActivationRequestAction(
  _prev: ActivationRequestState,
  formData: FormData
): Promise<ActivationRequestState> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Debes iniciar sesión." };

  const pending = await isPendingIntegrator(userId);
  const accountType = await getUserAccountType(userId);
  if (!pending && accountType !== "integrator") {
    return {
      ok: false,
      error: "Solo los integradores pueden solicitar activación de producción.",
    };
  }

  const parsed = schema.safeParse({
    companyName: formData.get("companyName"),
    nif: formData.get("nif"),
    email: formData.get("email"),
    message: formData.get("message") || undefined,
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first?.message ?? "Datos inválidos" };
  }

  const existingPending = await prisma.activationRequest.findFirst({
    where: { userId, status: "PENDING" },
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
        userId,
        email,
        companyName: parsed.data.companyName.trim(),
        nif: parsed.data.nif,
        message: parsed.data.message?.trim() || null,
        status: "PENDING",
      },
    });

    void sendActivationRequestAdminEmail({
      userId,
      email,
      companyName: parsed.data.companyName.trim(),
      nif: parsed.data.nif,
      message: parsed.data.message?.trim() || null,
    });

    revalidatePath("/partner/activation");
    revalidatePath("/admin/requests");
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
