import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Información legal — SimpleFactu",
};

const legalLinks: Array<{ href: string; label: string }> = [
  { href: "/legal/aviso-legal", label: "Aviso legal" },
  { href: "/legal/privacidad", label: "Política de privacidad" },
  { href: "/legal/terminos", label: "Términos y condiciones" },
  { href: "/legal/dpa", label: "Encargado de tratamiento (DPA)" },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-8 md:grid-cols-[14rem_1fr]">
      <aside className="md:sticky md:top-8 md:h-fit">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Información legal
        </h2>
        <nav className="space-y-1 text-sm">
          {legalLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block rounded px-2 py-1.5 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>
      <article className="prose prose-sm max-w-none rounded border border-gray-200 bg-white p-6">
        {children}
      </article>
    </div>
  );
}
