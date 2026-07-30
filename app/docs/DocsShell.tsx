"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandWordmark } from "../BrandWordmark";
import type { DocMeta } from "@/lib/docs/source";
import { DocsSidebarNav } from "./DocsSidebarNav";

type Props = {
  pages: DocMeta[];
  rootSlug: string;
  children: ReactNode;
};

const navLinkClass =
  "rounded px-3 py-1.5 text-sm text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg";

/**
 * Docs chrome. API reference must NOT sit inside transform / backdrop-filter
 * ancestors — Scalar’s client modal uses position:fixed and would otherwise
 * anchor to the article column (shifted right, close button floating).
 *
 * Header mirrors the app chrome: BrandWordmark + muted section label, same
 * sticky bar tokens (no ad-hoc SF badge).
 */
export function DocsShell({ pages, rootSlug, children }: Props) {
  const pathname = usePathname();
  const isApiReference = pathname === "/docs/api-reference";

  return (
    <div className="relative min-h-screen bg-surface-muted font-display">
      {/* Glow layers without overflow:hidden on the shell (avoids clipping
          Scalar overlays). Decorative only. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-[15%] left-[10%] h-[60vw] w-[60vw] rounded-full bg-[radial-gradient(circle,rgba(var(--glow-color-1),0.045)_0%,rgba(var(--glow-color-1),0)_70%)] blur-[80px]" />
        <div className="absolute -bottom-[10%] -right-[5%] h-[50vw] w-[50vw] rounded-full bg-[radial-gradient(circle,rgba(var(--glow-color-2),0.035)_0%,rgba(var(--glow-color-2),0)_70%)] blur-[100px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-outline-soft/70 bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-baseline gap-3 lg:gap-8">
            <BrandWordmark href="/" />
            <Link
              href="/docs"
              className="hidden text-sm font-medium text-fg-muted transition-colors hover:text-fg sm:inline"
            >
              Documentación
            </Link>
          </div>
          <nav className="flex shrink-0 items-center gap-1 font-display">
            <Link href="/docs/api-reference" className={navLinkClass}>
              Referencia API
            </Link>
            <Link href="/invoices" className={navLinkClass}>
              Ir a la App
            </Link>
          </nav>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-[16rem_1fr] items-start">
        <DocsSidebarNav pages={pages} rootSlug={rootSlug} />

        {isApiReference ? (
          <div className="order-1 min-w-0 md:order-2 rounded-2xl border border-outline-soft bg-surface p-4 md:p-6 shadow-lg">
            {children}
          </div>
        ) : (
          <article className="order-1 panel-premium rounded-2xl p-6 md:order-2 md:p-10 border border-outline-soft bg-surface/90 backdrop-blur-md shadow-lg animate-fade-in-up">
            {children}
          </article>
        )}
      </div>
    </div>
  );
}
