import "server-only";

import { cookies } from "next/headers";
import { isUserAdmin } from "@/lib/auth/admin";
import type { AppRole } from "@/lib/auth/app-role";

export const PREVIEW_COOKIE_NAME = "sf_admin_preview_role";

/**
 * Get the current admin preview role override from cookies if the user is an admin.
 * Returns null if not set or if user is not an admin.
 */
export async function getAdminPreviewRole(userId: string): Promise<AppRole | null> {
  const isAdmin = await isUserAdmin(userId);
  if (!isAdmin) return null;

  const cookieStore = await cookies();
  const val = cookieStore.get(PREVIEW_COOKIE_NAME)?.value?.trim().toLowerCase();
  if (val === "partner" || val === "user" || val === "admin") {
    return val as AppRole;
  }
  return null;
}
