"use server";

import { auth } from "@clerk/nextjs/server";
import { getUserAccountType, isPendingIntegrator } from "@/lib/auth/account-type";
import {
  createActivationRequestForUser,
  type SubmitActivationResult,
} from "@/lib/activation/submit-request";

export type AutonomoActivationRequestState = SubmitActivationResult | null;

export async function submitAutonomoActivationRequestAction(
  _prev: AutonomoActivationRequestState,
  formData: FormData
): Promise<AutonomoActivationRequestState> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Debes iniciar sesión." };

  if (await isPendingIntegrator(userId)) {
    return {
      ok: false,
      error: "Usa la página de activación de integrador.",
    };
  }

  const accountType = await getUserAccountType(userId);
  if (accountType === "integrator") {
    return {
      ok: false,
      error: "Usa la página de activación de integrador.",
    };
  }

  return createActivationRequestForUser({
    userId,
    kind: "AUTONOMO",
    formData,
  });
}
