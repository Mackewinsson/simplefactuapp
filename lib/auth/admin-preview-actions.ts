"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { isUserAdmin } from "@/lib/auth/admin";
import { PREVIEW_COOKIE_NAME } from "./admin-preview";
import {
  IMPERSONATE_COOKIE_NAME,
  IMPERSONATE_NAME_COOKIE_NAME,
} from "./admin-impersonate";
import type { AppRole } from "./app-role";

export async function setAdminPreviewRoleAction(role: AppRole | "clear") {
  const { userId } = await auth();
  if (!userId) return;

  const isAdmin = await isUserAdmin(userId);
  if (!isAdmin) return;

  const cookieStore = await cookies();

  if (role === "clear" || role === "admin") {
    cookieStore.delete(PREVIEW_COOKIE_NAME);
    cookieStore.delete(IMPERSONATE_COOKIE_NAME);
    cookieStore.delete(IMPERSONATE_NAME_COOKIE_NAME);
    redirect("/admin");
  } else {
    cookieStore.set(PREVIEW_COOKIE_NAME, role, {
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    // Generic role preview is not tenant-specific
    cookieStore.delete(IMPERSONATE_COOKIE_NAME);
    cookieStore.delete(IMPERSONATE_NAME_COOKIE_NAME);

    if (role === "partner") {
      redirect("/partner");
    } else {
      redirect("/invoices");
    }
  }
}
