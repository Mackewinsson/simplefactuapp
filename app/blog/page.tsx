import type { Metadata } from "next";
import Link from "next/link";
import { articles, formatArticleDate } from "@/lib/blog/articles";
import { BrandWordmark } from "../BrandWordmark";

export const metadata: Metadata = {
  title: "Blog sobre Veri*Factu y facturación electrónica — Simple*Factu",
  description:
    "Artículos, guías y tutoriales sobre Veri*Factu, facturación electrónica, obligaciones fiscales para autónomos y pymes en España.",
  alternates: {
    canonical: "https://simplefactu.com/blog",
  },
  openGraph: {
    title: "Blog sobre Veri*Factu y facturación electrónica",
    description:
      "Guías prácticas sobre Veri*Factu, certificado FNMT, plazos legales y facturación electrónica para autónomos y pymes en España.",
    url: "https://simplefactu.com/blog",
    siteName: "Simple*Factu",
    locale: "es_ES",
    type: "website",
  },
};

const sorted = [...articles].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

export default function BlogPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="border-b border-outline-soft bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <BrandWordmark />
          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className="hidden rounded px-3 py-1.5 text-sm text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg sm:inline-flex"
            >
              Inicio
            </Link>
            <Link
              href="/sign-in"
              className="hidden rounded px-3 py-1.5 text-sm text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg sm:inline-flex"
            >
              Iniciar sesión
            </Link>
            <Link href="/sign-up" className="btn btn-sm btn-primary sm:ml-2">
              Crear cuenta
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <p className="mb-4 text-xs font-medium uppercase tracking-widest text-fg-subtle">
          Blog
        </p>
        <h1 className="mb-2 text-3xl font-semibold text-fg">
          Veri*Factu y facturación electrónica
        </h1>
        <p className="mb-10 text-base text-fg-muted">
          Guías prácticas para autónomos y pymes sobre el sistema Veri*Factu de
          la AEAT, obligaciones fiscales y herramientas de facturación.
        </p>

        <ol className="space-y-6" reversed>
          {sorted.map((article) => (
            <li key={article.slug}>
              <article className="group rounded-xl border border-outline-soft bg-surface p-5 transition-shadow hover:shadow-sm">
                <div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <time
                    dateTime={article.date}
                    className="text-xs text-fg-subtle"
                  >
                    {formatArticleDate(article.date)}
                  </time>
                  <span className="text-xs text-fg-subtle">·</span>
                  <span className="text-xs text-fg-subtle">
                    {article.readingMinutes} min de lectura
                  </span>
                </div>
                <Link href={`/blog/${article.slug}`} className="block">
                  <h2 className="mb-2 text-lg font-semibold text-fg group-hover:text-brand">
                    {article.title}
                  </h2>
                  <p className="text-sm text-fg-muted">{article.excerpt}</p>
                </Link>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block rounded-full border border-outline-soft px-2 py-0.5 text-xs text-fg-subtle"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            </li>
          ))}
        </ol>
      </main>

      <footer className="border-t border-outline-soft bg-surface">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 text-xs text-fg-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>Simple·Factu — Servicio compatible con Veri·Factu (AEAT)</span>
          <nav className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/" className="hover:text-fg">
              Inicio
            </Link>
            <Link href="/docs" className="hover:text-fg">
              Documentación
            </Link>
            <Link href="/legal/privacidad" className="hover:text-fg">
              Privacidad
            </Link>
            <Link href="/legal/aviso-legal" className="hover:text-fg">
              Aviso legal
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
