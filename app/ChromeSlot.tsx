"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Hides the surrounding app chrome (header, onboarding banner, footer,
 * the main container with max-w-6xl) on routes that bring their own
 * layout chrome — currently /docs (Fumadocs) and /sign-in /sign-up
 * (Clerk widget).
 *
 * Wrapping server components in this client component is the standard
 * App Router pattern for "render this only when the URL matches X"
 * without losing the wrapped server components' SSR data fetching.
 */
const HIDDEN_PREFIXES = ["/docs", "/sign-in", "/sign-up"];

export function ChromeSlot({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname && HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return null;
  }
  return <>{children}</>;
}

/**
 * Counterpart to ChromeSlot: renders children only on routes WITHOUT their
 * own chrome. Used to gate the constrained <main> container so /docs can
 * use the full width.
 */
export function MainContainer({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isFullWidth =
    pathname && HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isFullWidth) {
    return <div className="flex-1">{children}</div>;
  }
  return <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>;
}
