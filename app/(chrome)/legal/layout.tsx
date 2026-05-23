"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const legalLinks: Array<{ href: string; label: string }> = [
  { href: "/legal/aviso-legal", label: "Aviso legal" },
  { href: "/legal/privacidad", label: "Política de privacidad" },
  { href: "/legal/terminos", label: "Términos y condiciones" },
  { href: "/legal/dpa", label: "Encargado de tratamiento (DPA)" },
  { href: "/legal/cookies", label: "Política de cookies" },
  { href: "/legal/cancelacion", label: "Cancelación y reembolso" },
  { href: "/legal/accesibilidad", label: "Accesibilidad" },
  {
    href: "/legal/declaracion-responsable",
    label: "Declaración responsable Veri*Factu",
  },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="grid gap-8 md:grid-cols-[16rem_1fr] items-start font-display animate-fade-in-up">
      <aside className="md:sticky md:top-20 space-y-4">
        <h2 className="px-2 text-[10px] font-black uppercase tracking-wider text-fg-subtle">
          Información legal
        </h2>
        <nav className="space-y-1 text-xs font-bold">
          {legalLinks.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 transition-all ${
                  active
                    ? "bg-accent/10 text-accent border border-accent-outline/20"
                    : "text-fg-muted hover:bg-surface-muted hover:text-fg border border-transparent"
                }`}
              >
                <span>{l.label}</span>
                {active && (
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
      <article className="prose prose-sm max-w-none panel-premium rounded-2xl p-6 md:p-10 border border-outline-soft bg-surface/90 backdrop-blur-md shadow-lg font-sans text-fg-muted leading-relaxed prose-headings:font-display prose-headings:font-black prose-headings:tracking-tight prose-headings:text-fg prose-strong:text-fg prose-strong:font-bold">
        {children}
      </article>
    </div>
  );
}
