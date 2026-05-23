"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
                  ? "rounded-lg border border-outline-soft bg-surface px-3 py-1.5 text-sm font-bold text-fg shadow-sm font-display transition-all"
                  : "rounded-lg px-3 py-1.5 text-sm font-semibold text-fg-muted hover:text-fg hover:bg-surface-muted/50 transition-all font-display"
              }
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        className="inline-flex items-center rounded-lg border border-outline bg-surface px-3 py-1.5 text-sm font-bold text-fg-muted hover:bg-surface-muted transition-all shadow-sm font-display lg:hidden"
        aria-expanded={isOpen}
        aria-controls="mobile-app-nav"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-1.5 text-fg-subtle">
          <rect x="1" y="3.5" width="14" height="1.5" rx="0.75" fill="currentColor"/>
          <rect x="1" y="7.25" width="14" height="1.5" rx="0.75" fill="currentColor"/>
          <rect x="1" y="11" width="14" height="1.5" rx="0.75" fill="currentColor"/>
        </svg>
        Menú
      </button>

      {mounted && createPortal(
        <div
          className={`fixed inset-0 z-[100] lg:hidden transition-opacity duration-200 bg-black/30 ${
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
            <div className="mb-4 flex items-center justify-between font-display border-b border-outline-soft/60 pb-3">
              <span className="text-sm font-bold text-fg">Navegación</span>
              <button
                type="button"
                className="rounded-lg p-1.5 text-fg-subtle hover:bg-surface-muted hover:text-fg-muted transition-colors"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar menú"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              {links.map((link) => {
                const active = isNavLinkActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={
                      active
                        ? "rounded-lg border-l-4 border-accent bg-accent-muted py-2.5 pl-3 pr-4 text-sm font-bold text-accent-foreground-muted font-display transition-all"
                        : "rounded-lg px-3 py-2.5 text-sm font-semibold text-fg-muted hover:bg-surface-muted hover:text-fg font-display transition-all"
                    }
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>,
        document.body
      )}
    </>
  );
}

