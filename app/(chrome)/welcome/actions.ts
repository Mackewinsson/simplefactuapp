"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isSandboxAutoApproveIntegrators } from "@/lib/auth/account-type";
import { isAccountType, type AccountType } from "@/lib/auth/account-type-shared";

export type SetAccountTypeState = {
  ok: boolean;
  error?: string;
} | null;

export async function setAccountTypeAction(
  type: AccountType
): Promise<SetAccountTypeState> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "Debes iniciar sesión." };
  }
  if (!isAccountType(type)) {
    return { ok: false, error: "Tipo de cuenta no válido." };
  }

  try {
    const api = await clerkClient();
    const user = await api.users.getUser(userId);
    const currentMeta = (user.publicMetadata ?? {}) as Record<string, unknown>;

    const nextMeta: Record<string, unknown> = {
      ...currentMeta,
      accountType: type,
    };

    // QA / sandbox: grant partner immediately so the integrator can test.
    if (type === "integrator" && isSandboxAutoApproveIntegrators()) {
      nextMeta.role = "partner";
    }

    await api.users.updateUser(userId, {
      publicMetadata: nextMeta,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "No se pudo guardar el tipo de cuenta.";
    return { ok: false, error: msg };
  }

  if (type === "autonomo") {
    redirect("/invoices");
  }

  if (isSandboxAutoApproveIntegrators()) {
    redirect("/partner");
  }

  redirect("/partner/activation");
}
