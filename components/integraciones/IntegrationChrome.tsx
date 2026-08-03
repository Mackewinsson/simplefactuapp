import Link from "next/link";
import type { ReactNode } from "react";
import { BrandWordmark } from "@/app/BrandWordmark";

export function IntegrationChrome({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="border-b border-outline-soft bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <BrandWordmark />
          <nav className="flex items-center gap-2">
            <Link
              href="/integraciones"
              className="hidden rounded px-3 py-1.5 text-sm text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg sm:inline-flex"
            >
              Integraciones
            </Link>
            <Link
              href="/docs"
              className="hidden rounded px-3 py-1.5 text-sm text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg sm:inline-flex"
            >
              Docs API
            </Link>
            <Link href="/sign-up" className="btn btn-sm btn-primary ml-2">
              Crear cuenta gratis
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        {children}
      </main>

      <footer className="border-t border-outline-soft bg-surface py-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 text-center text-xs text-fg-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-left">
          <span>Simple*Factu — API Veri*Factu para developers y ERPs</span>
          <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <Link href="/integraciones" className="hover:text-fg">
              Integraciones
            </Link>
            <Link href="/docs" className="hover:text-fg">
              Documentación
            </Link>
            <Link href="/blog" className="hover:text-fg">
              Blog
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
