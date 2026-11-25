"use server";

import { auth } from "@clerk/nextjs/server";
import { getUserAccountType, isPendingIntegrator } from "@/lib/auth/account-type";
import {
  createActivationRequestForUser,
  type SubmitActivationResult,
} from "@/lib/activation/submit-request";

export type ActivationRequestState = SubmitActivationResult | null;

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
      error: "Solo los integradores pueden solicitar activación de producción aquí.",
    };
  }

  return createActivationRequestForUser({
    userId,
    kind: "INTEGRATOR",
    formData,
  });
}
