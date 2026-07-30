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
