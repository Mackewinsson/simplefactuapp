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
                  ? "border-b-2 border-fg py-2 text-sm font-semibold leading-none text-fg"
                  : "border-b-2 border-transparent py-2 text-sm leading-none text-fg-muted hover:text-fg"
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
        Menú
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 bg-black/30 lg:hidden"
          onClick={() => setIsOpen(false)}
        >
          <nav
            id="mobile-app-nav"
            className="ml-auto flex h-full w-72 max-w-[85vw] flex-col gap-1 overflow-y-auto bg-surface p-4 shadow-xl"
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
      ) : null}
    </>
  );
}
