import type { Metadata } from "next";
import Link from "next/link";
import { absoluteTitle } from "@/lib/branding";
import {
  articles,
  formatArticleDate,
  getCornerstoneArticles,
} from "@/lib/blog/articles";
import { BrandWordmark } from "../BrandWordmark";
import { publicRobots } from "@/lib/seo/robots";
import { canonicalUrl } from "@/lib/seo/site-url";

export const metadata: Metadata = {
  title: absoluteTitle("Blog Veri*Factu: guías de facturación electrónica"),
  description:
    "Guías prácticas sobre Veri*Factu: certificado FNMT, primera factura a la AEAT, plazos legales y software compatible para autónomos y pymes en España.",
  robots: publicRobots,
  alternates: {
    canonical: canonicalUrl("/blog"),
  },
  openGraph: {
    title: "Blog sobre Veri*Factu y facturación electrónica",
    description:
      "Guías prácticas sobre Veri*Factu, certificado FNMT, plazos legales y facturación electrónica para autónomos y pymes en España.",
    url: canonicalUrl("/blog"),
    siteName: "Simple*Factu",
    locale: "es_ES",
    type: "website",
  },
};

const sorted = [...articles].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

const cornerstone = getCornerstoneArticles();

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

        {cornerstone.length > 0 && (
          <section className="mb-12 rounded-xl border border-outline-soft bg-surface-muted p-5">
            <h2 className="mb-1 text-base font-semibold text-fg">
              Empieza por aquí
            </h2>
            <p className="mb-4 text-sm text-fg-muted">
              El recorrido completo, de la normativa a tu primera factura
              enviada a la AEAT.
            </p>
            <ol className="space-y-2">
              {cornerstone.map((article, index) => (
                <li key={article.slug} className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-0.5 text-xs font-semibold tabular-nums text-fg-subtle"
                  >
                    {index + 1}.
                  </span>
                  <Link
                    href={`/blog/${article.slug}`}
                    className="text-sm font-medium text-fg hover:text-brand"
                  >
                    {article.title}
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}

        <h2 className="mb-6 text-base font-semibold text-fg">
          Todos los artículos
        </h2>
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
                  <h3 className="mb-2 text-lg font-semibold text-fg group-hover:text-brand">
                    {article.title}
                  </h3>
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
          <span>Simple*Factu — Servicio compatible con Veri*Factu (AEAT)</span>
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
