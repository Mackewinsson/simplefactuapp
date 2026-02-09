import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/invoices(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  try {
    if (isProtectedRoute(req)) await auth.protect();
  } catch {
    // Avoid 500 on Edge when Clerk fails (e.g. missing env). Redirect protected routes to sign-in.
    if (isProtectedRoute(req)) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }
  }
});

export const config = {
  matcher: [
    // Skip _next, static files, and Clerk's auth assets
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
