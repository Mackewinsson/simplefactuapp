"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { DocMeta } from "@/lib/docs/source";

type Props = {
  pages: DocMeta[];
  rootSlug: string;
};

export function DocsSidebarNav({ pages, rootSlug }: Props) {
  const pathname = usePathname();

  const isLinkActive = (slug: string) => {
    const targetPath = slug === rootSlug ? "/docs" : `/docs/${slug}`;
    return pathname === targetPath;
  };

  return (
    <aside className="order-2 md:order-1 md:sticky md:top-20 space-y-6">
      {/* Spotlight Mock Search Input */}
      <div className="relative group">
        <svg className="absolute left-3.5 top-3 h-4 w-4 text-fg-subtle group-focus-within:text-accent transition-colors" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar documentación..."
          className="w-full pl-9 pr-12 py-2 text-xs rounded-xl border border-outline bg-surface/50 backdrop-blur-sm placeholder:text-fg-subtle focus:border-accent-outline focus:outline-none focus:ring-2 focus:ring-accent-outline/10 transition-all font-sans font-medium"
          readOnly
        />
        <kbd className="absolute right-2.5 top-2.5 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-outline-soft bg-surface-muted text-[9px] font-black text-fg-subtle select-none shadow-sm pointer-events-none">
          <span>⌘</span>K
        </kbd>
      </div>

      <div>
        <h2 className="mb-2.5 px-2 text-[10px] font-black uppercase tracking-wider text-fg-subtle">
          Guías y tutoriales
        </h2>
        <nav className="space-y-1 text-xs font-bold">
          {pages.map((p) => {
            const active = isLinkActive(p.slug);
            return (
              <Link
                key={p.slug}
                href={p.slug === rootSlug ? "/docs" : `/docs/${p.slug}`}
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 transition-all ${
                  active
                    ? "bg-accent/10 text-accent border border-accent-outline/20"
                    : "text-fg-muted hover:bg-surface-muted hover:text-fg border border-transparent"
                }`}
              >
                <span>{p.title}</span>
                {active && (
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                )}
              </Link>
            );
          })}
          <Link
            href="/docs/api-reference"
            className={`group flex items-center justify-between rounded-xl px-3 py-2.5 transition-all ${
              pathname === "/docs/api-reference"
                ? "bg-accent/10 text-accent border border-accent-outline/20"
                : "text-fg-muted hover:bg-surface-muted hover:text-fg border border-transparent"
            }`}
          >
            <span>Referencia API</span>
            {pathname === "/docs/api-reference" && (
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            )}
          </Link>
        </nav>
      </div>
    </aside>
  );
}
