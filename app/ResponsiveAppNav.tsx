"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function isNavLinkActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type NavLink = {
  href: string;
  label: string;
};

type Props = {
  links: NavLink[];
};

export function ResponsiveAppNav({ links }: Props) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <>
      <nav className="hidden items-center lg:flex lg:gap-6">
        {links.map((link) => {
          const active = isNavLinkActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "rounded px-2.5 py-1.5 text-sm font-semibold text-fg bg-surface-muted"
                  : "rounded px-2.5 py-1.5 text-sm text-fg-muted hover:text-fg hover:bg-surface-muted/60 transition-colors"
              }
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        className="inline-flex items-center rounded border border-outline bg-surface px-3 py-1.5 text-sm font-medium text-fg-muted hover:bg-surface-muted lg:hidden"
        aria-expanded={isOpen}
        aria-controls="mobile-app-nav"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-1.5">
          <rect x="1" y="3.5" width="14" height="1.5" rx="0.75" fill="currentColor"/>
          <rect x="1" y="7.25" width="14" height="1.5" rx="0.75" fill="currentColor"/>
          <rect x="1" y="11" width="14" height="1.5" rx="0.75" fill="currentColor"/>
        </svg>
        Menú
      </button>

      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-200 bg-black/30 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      >
        <nav
          id="mobile-app-nav"
          className={`ml-auto flex h-full w-72 max-w-[85vw] flex-col gap-1 overflow-y-auto bg-surface p-4 shadow-xl transition-transform duration-200 ease-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-fg">Navegación</span>
            <button
              type="button"
              className="rounded p-1 text-fg-subtle hover:bg-surface-muted hover:text-fg-muted"
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar menú"
            >
              ✕
            </button>
          </div>
          {links.map((link) => {
            const active = isNavLinkActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "rounded border-l-4 border-fg bg-surface-muted py-2 pl-2 pr-3 text-sm font-semibold text-fg"
                    : "rounded px-3 py-2 text-sm text-fg-muted hover:bg-surface-muted hover:text-fg"
                }
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
