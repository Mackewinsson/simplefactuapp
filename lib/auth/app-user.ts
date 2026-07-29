import "server-only";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getEffectiveUserId } from "@/lib/auth/admin-impersonate";

export type AppUserIds = {
  /** Clerk session (admin when impersonating). Use for ensure*ApiKey / admin checks. */
  sessionUserId: string;
  /** Effective data owner (impersonated user when active). Use for Prisma. */
  userId: string;
};

/**
 * Session + effective data userId (honours admin impersonation for Prisma-scoped data).
 */
export async function requireAppUser(): Promise<AppUserIds> {
  const ids = await getAppUserIds();
  if (!ids) redirect("/sign-in");
  return ids;
}

/** Same as requireAppUser but returns null instead of redirecting (for server actions). */
export async function getAppUserIds(): Promise<AppUserIds | null> {
  const { userId: sessionUserId } = await auth();
  if (!sessionUserId) return null;
  const userId = await getEffectiveUserId(sessionUserId);
  return { sessionUserId, userId };
}
