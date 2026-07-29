"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { PREVIEW_COOKIE_NAME } from "@/lib/auth/admin-preview";
import {
  IMPERSONATE_COOKIE_NAME,
  IMPERSONATE_NAME_COOKIE_NAME,
} from "@/lib/auth/admin-impersonate";

const COOKIE_OPTS = {
  path: "/",
  maxAge: 60 * 60 * 24, // 1 day
  sameSite: "lax" as const,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};

export async function startImpersonationAction(
  tenantId: string,
  tenantName?: string,
  targetRedirect?: string
) {
  await requireAdmin();

  const id = tenantId.trim();
  if (!id) {
    throw new Error("tenantId requerido");
  }

  const cookieStore = await cookies();
  cookieStore.set(IMPERSONATE_COOKIE_NAME, id, COOKIE_OPTS);

  if (tenantName?.trim()) {
    cookieStore.set(IMPERSONATE_NAME_COOKIE_NAME, tenantName.trim(), COOKIE_OPTS);
  } else {
    cookieStore.delete(IMPERSONATE_NAME_COOKIE_NAME);
  }

  // Align nav with the impersonated surface (partner vs autónomo)
  const targetRole = id.startsWith("rp_") ? "partner" : "user";
  cookieStore.set(PREVIEW_COOKIE_NAME, targetRole, COOKIE_OPTS);

  const dest =
    targetRedirect || (id.startsWith("rp_") ? "/partner" : "/invoices");
  redirect(dest);
}

export async function stopImpersonationAction(returnPath = "/admin/users") {
  await requireAdmin();

  const cookieStore = await cookies();
  cookieStore.delete(IMPERSONATE_COOKIE_NAME);
  cookieStore.delete(IMPERSONATE_NAME_COOKIE_NAME);
  cookieStore.delete(PREVIEW_COOKIE_NAME);

  redirect(returnPath);
}
