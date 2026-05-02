import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

function adminAllowlist(): Set<string> {
  const raw = process.env.ADMIN_CLERK_USER_IDS?.trim();
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

function hasAdminRoleInMetadata(metadata: Record<string, unknown> | undefined): boolean {
  return metadata?.role === "admin";
}

/**
 * True if this Clerk user may access /admin (allowlist or publicMetadata.role === "admin").
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  if (adminAllowlist().has(userId)) return true;
  const api = await clerkClient();
  const user = await api.users.getUser(userId);
  return hasAdminRoleInMetadata(user.publicMetadata as Record<string, unknown>);
}

/**
 * Server-only: redirect non-admins away from admin routes.
 */
export async function requireAdmin(): Promise<{ userId: string }> {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  if (!(await isUserAdmin(userId))) {
    redirect("/invoices");
  }
  return { userId };
}
