import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { APP_DOCS_LABEL } from "@/lib/branding";
import { listDocs, ROOT_SLUG } from "@/lib/docs/source";
import { DocsSidebarNav } from "./DocsSidebarNav";
import { publicRobots } from "@/lib/seo/robots";

export const metadata: Metadata = {
  robots: publicRobots,
};

/**
 * Layout for /docs/*.
 *
 * Two-column layout: sidebar with the page index (read from
 * content/docs/meta.json) + main content. The constrained <main> from the
 * root layout doesn't apply here because ChromeSlot opts /docs out — see
 * app/ChromeSlot.tsx.
 */
export default function DocsLayout({ children }: { children: ReactNode }) {
  const pages = listDocs();

  return (
    <div className="min-h-screen bg-surface-muted premium-glow-bg font-display">
      <header className="sticky top-0 z-50 border-b border-outline-soft/75 bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/docs" className="text-base font-black text-fg tracking-tight flex items-center gap-2">
              <span className="h-5.5 w-5.5 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-xs shadow-md shadow-accent/15">SF</span>
              {APP_DOCS_LABEL}
            </Link>
          </div>
          <nav className="flex items-center gap-4 text-xs font-bold text-fg-subtle">
            <Link href="/docs/api-reference" className="hover:text-fg transition-colors">
              Referencia API
            </Link>
            <span className="h-3 w-px bg-outline-soft" />
            <Link href="/invoices" className="inline-flex items-center gap-1 hover:text-fg transition-colors text-fg-subtle">
              Ir a la App <span className="text-[10px]">→</span>
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-[16rem_1fr] items-start">
        <DocsSidebarNav pages={pages} rootSlug={ROOT_SLUG} />

        <article className="order-1 panel-premium rounded-2xl p-6 md:order-2 md:p-10 border border-outline-soft bg-surface/90 backdrop-blur-md shadow-lg animate-fade-in-up">
          {children}
        </article>
      </div>
    </div>
  );
}
