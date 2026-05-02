import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/invoices(.*)",
  "/settings(.*)",
  "/admin(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

function adminAllowlistIds(): Set<string> {
  const raw = process.env.ADMIN_CLERK_USER_IDS?.trim();
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

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

  const allow = adminAllowlistIds();
  if (isAdminRoute(req) && allow.size > 0) {
    const { userId } = await authFn();
    if (!userId || !allow.has(userId)) {
      return NextResponse.redirect(new URL("/invoices", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
