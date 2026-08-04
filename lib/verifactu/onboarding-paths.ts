/** Paths that stay reachable while onboarding is incomplete. Pure — safe for tsx tests. */
export function isOnboardingExemptPath(pathname: string): boolean {
  return (
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/welcome") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/partner") ||
    pathname.startsWith("/legal") ||
    pathname.startsWith("/admin-access-denied") ||
    pathname.startsWith("/partner-access-denied") ||
    pathname === "/sign-in" ||
    pathname === "/sign-up"
  );
}
