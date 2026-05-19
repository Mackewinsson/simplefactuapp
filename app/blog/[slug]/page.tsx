import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  articles,
  formatArticleDate,
  getAllSlugs,
  getArticle,
} from "@/lib/blog/articles";
import { BrandWordmark } from "../../BrandWordmark";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};

  const url = `https://simplefactu.com/blog/${article.slug}`;
  return {
    title: `${article.title} — Simple*Factu`,
    description: article.seoDescription,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.seoDescription,
      url,
      siteName: "Simple*Factu",
      locale: "es_ES",
      type: "article",
      publishedTime: article.date,
      tags: article.tags,
    },
  };
}

function jsonLd(article: ReturnType<typeof getArticle>) {
  if (!article) return null;
  const url = `https://simplefactu.com/blog/${article.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.seoDescription,
    datePublished: article.date,
    author: {
      "@type": "Person",
      name: "Mackewinsson Palencia",
    },
    publisher: {
      "@type": "Organization",
      name: "Simple*Factu",
      url: "https://simplefactu.com",
    },
    url,
    inLanguage: "es",
    keywords: article.tags.join(", "),
  };
}

const sorted = [...articles].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const currentIndex = sorted.findIndex((a) => a.slug === slug);
  const prev = sorted[currentIndex + 1] ?? null;
  const next = sorted[currentIndex - 1] ?? null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(article)) }}
      />
      <div className="flex min-h-screen flex-col bg-surface">
        <header className="border-b border-outline-soft bg-surface">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <BrandWordmark />
            <nav className="flex items-center gap-1">
              <Link
                href="/blog"
                className="hidden rounded px-3 py-1.5 text-sm text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg sm:inline-flex"
              >
                Blog
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

        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6 sm:py-16">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-1.5 text-xs text-fg-subtle">
            <Link href="/" className="hover:text-fg">
              Inicio
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-fg">
              Blog
            </Link>
            <span>/</span>
            <span className="truncate text-fg-muted">{article.title}</span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
              <time dateTime={article.date} className="text-xs text-fg-subtle">
                {formatArticleDate(article.date)}
              </time>
              <span className="text-xs text-fg-subtle">·</span>
              <span className="text-xs text-fg-subtle">
                {article.readingMinutes} min de lectura
              </span>
            </div>
            <h1 className="text-2xl font-semibold leading-snug text-fg sm:text-3xl">
              {article.title}
            </h1>
            <p className="mt-3 text-base text-fg-muted">{article.excerpt}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block rounded-full border border-outline-soft px-2 py-0.5 text-xs text-fg-subtle"
                >
                  {tag}
                </span>
              ))}
            </div>
          </header>

          {/* Article body */}
          <div
            className="prose prose-sm sm:prose max-w-none prose-headings:font-semibold prose-headings:text-fg prose-p:text-fg-muted prose-li:text-fg-muted prose-a:text-brand prose-strong:text-fg prose-code:rounded prose-code:bg-surface-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-xs prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:bg-surface-muted prose-pre:p-4 prose-pre:text-xs prose-table:border-collapse prose-th:border prose-th:border-outline-soft prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:text-xs prose-th:text-fg prose-td:border prose-td:border-outline-soft prose-td:px-3 prose-td:py-2 prose-td:text-xs prose-td:text-fg-muted"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* CTA */}
          <div className="mt-12 rounded-xl border border-outline-soft bg-surface-muted px-6 py-5">
            <p className="mb-1 text-sm font-semibold text-fg">
              ¿Listo para cumplir con Veri*Factu?
            </p>
            <p className="mb-4 text-sm text-fg-muted">
              Simple*Factu es la API y aplicación que gestiona el envío de
              facturas a la AEAT por ti. Empieza gratis.
            </p>
            <Link href="/sign-up" className="btn btn-sm btn-primary">
              Crear cuenta gratis
            </Link>
          </div>

          {/* Prev / Next */}
          {(prev || next) && (
            <nav className="mt-10 flex items-start justify-between gap-4 border-t border-outline-soft pt-8 text-sm">
              {prev ? (
                <Link
                  href={`/blog/${prev.slug}`}
                  className="group flex max-w-[48%] flex-col gap-0.5"
                >
                  <span className="text-xs text-fg-subtle">← Anterior</span>
                  <span className="text-fg group-hover:text-brand">
                    {prev.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link
                  href={`/blog/${next.slug}`}
                  className="group flex max-w-[48%] flex-col items-end gap-0.5 text-right"
                >
                  <span className="text-xs text-fg-subtle">Siguiente →</span>
                  <span className="text-fg group-hover:text-brand">
                    {next.title}
                  </span>
                </Link>
              )}
            </nav>
          )}
        </main>

        <footer className="border-t border-outline-soft bg-surface">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 text-xs text-fg-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span>
              Simple·Factu — Servicio compatible con Veri·Factu (AEAT)
            </span>
            <nav className="flex flex-wrap gap-x-4 gap-y-1">
              <Link href="/" className="hover:text-fg">
                Inicio
              </Link>
              <Link href="/blog" className="hover:text-fg">
                Blog
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
    </>
  );
}
