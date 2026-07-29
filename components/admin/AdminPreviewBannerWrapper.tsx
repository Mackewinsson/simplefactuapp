import { auth } from "@clerk/nextjs/server";
import { isUserAdmin } from "@/lib/auth/admin";
import { getAdminPreviewRole } from "@/lib/auth/admin-preview";
import { getAdminImpersonatedTenant } from "@/lib/auth/admin-impersonate";
import { devForceRole } from "@/lib/auth/app-role";
import { AdminPreviewBanner } from "./AdminPreviewBanner";

export async function AdminPreviewBannerWrapper() {
  const { userId } = await auth();
  if (!userId) return null;

  const forced = devForceRole();
  const isAdmin = forced ? forced === "admin" : await isUserAdmin(userId);
  if (!isAdmin) return null;

  const [previewRole, impersonation] = await Promise.all([
    getAdminPreviewRole(userId),
    getAdminImpersonatedTenant(userId),
  ]);

  return (
    <AdminPreviewBanner
      currentRole={previewRole}
      impersonation={impersonation}
    />
  );
}
