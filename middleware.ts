import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/invoices(.*)",
  "/settings(.*)",
  "/admin(.*)",
]);

export default clerkMiddleware(async (authFn, req) => {
  try {
    if (isProtectedRoute(req)) await authFn.protect();
  } catch {
    if (isProtectedRoute(req)) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Admin authorization is enforced in app/(chrome)/admin/layout.tsx via requireAdmin().
  // Do not duplicate allowlist checks here: they omitted publicMetadata.role and made
  // /admin look like a no-op (redirect to /invoices without feedback).

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
