import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { devForceRole } from "@/lib/auth/app-role";

function partnerAllowlist(): Set<string> {
  const raw = process.env.PARTNER_CLERK_USER_IDS?.trim();
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

function hasPartnerRoleInMetadata(metadata: Record<string, unknown> | undefined): boolean {
  return metadata?.role === "partner";
}

export async function isUserPartner(userId: string): Promise<boolean> {
  if (partnerAllowlist().has(userId)) return true;

  const { sessionClaims } = await auth();
  const metadata = sessionClaims?.metadata;
  if (metadata && typeof metadata === "object" && hasPartnerRoleInMetadata(metadata as Record<string, unknown>)) {
    return true;
  }

  try {
    const api = await clerkClient();
    const user = await api.users.getUser(userId);
    return hasPartnerRoleInMetadata(user.publicMetadata as Record<string, unknown>);
  } catch {
    return false;
  }
}

export async function requirePartner(): Promise<{ userId: string }> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const forced = devForceRole();
  if (forced === "partner" || forced === "admin") return { userId };
  if (!(await isUserPartner(userId))) {
    redirect("/partner-access-denied");
  }
  return { userId };
}
