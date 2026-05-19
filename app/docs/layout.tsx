import type { ReactNode } from "react";
import Link from "next/link";
import { APP_DOCS_LABEL } from "@/lib/branding";
import { listDocs, ROOT_SLUG } from "@/lib/docs/source";

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
    <div className="min-h-screen bg-surface-muted">
      <header className="border-b border-outline-soft bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/docs" className="text-base font-semibold text-fg">
              {APP_DOCS_LABEL}
            </Link>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/docs/api-reference" className="text-fg-muted hover:text-fg">
              Referencia API
            </Link>
            <Link href="/invoices" className="text-fg-muted hover:text-fg">
              Volver a la app
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-[14rem_1fr]">
        <article className="order-1 rounded border border-outline bg-surface p-6 md:order-2 md:p-8">
          {children}
        </article>
        <aside className="order-2 md:order-1 md:sticky md:top-8 md:h-fit">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-fg-subtle">
            Guías
          </h2>
          <nav className="space-y-1 text-sm">
            {pages.map((p) => (
              <Link
                key={p.slug}
                href={p.slug === ROOT_SLUG ? "/docs" : `/docs/${p.slug}`}
                className="block rounded px-2 py-1.5 text-fg-muted hover:bg-surface-hover hover:text-fg"
              >
                {p.title}
              </Link>
            ))}
            <Link
              href="/docs/api-reference"
              className="block rounded px-2 py-1.5 text-fg-muted hover:bg-surface-hover hover:text-fg"
            >
              Referencia API
            </Link>
          </nav>
        </aside>
      </div>
    </div>
  );
}
