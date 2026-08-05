import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { absoluteTitle, appDocumentTitle } from "@/lib/branding";
import {
  articles,
  formatArticleDate,
  getAllSlugs,
  getArticle,
  getArticleLastModified,
  getRelatedArticles,
} from "@/lib/blog/articles";
import { BrandWordmark } from "../../BrandWordmark";
import { publicRobots } from "@/lib/seo/robots";
import { canonicalUrl } from "@/lib/seo/site-url";

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

  const url = canonicalUrl(`/blog/${article.slug}`);

  return {
    // A crafted `seoTitle` is final: appending the brand would push it past
    // Google's truncation limit and waste the pixels that drive clicks.
    title: absoluteTitle(article.seoTitle ?? appDocumentTitle(article.title)),
    description: article.seoDescription,
    robots: publicRobots,
    alternates: { canonical: url },
    openGraph: {
      title: article.seoTitle ?? article.title,
      description: article.seoDescription,
      url,
      siteName: "Simple*Factu",
      locale: "es_ES",
      type: "article",
      publishedTime: article.date,
      modifiedTime: getArticleLastModified(article),
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: article.seoTitle ?? article.title,
      description: article.seoDescription,
    },
  };
}

import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildFAQSchema,
} from "@/lib/seo/schema";

function jsonLd(article: ReturnType<typeof getArticle>) {
  if (!article) return null;
  const articleSchema = buildArticleSchema({
    title: article.title,
    description: article.seoDescription,
    slug: article.slug,
    datePublished: article.date,
    dateModified: getArticleLastModified(article),
  });

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Inicio", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: article.title, url: `/blog/${article.slug}` },
  ]);

  const faqSchema = article.faqs ? buildFAQSchema(article.faqs) : null;

  return faqSchema
    ? [articleSchema, breadcrumbSchema, faqSchema]
    : [articleSchema, breadcrumbSchema];
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
  const related = getRelatedArticles(article);
  const lastModified = getArticleLastModified(article);
  const wasUpdated = lastModified !== article.date;

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
              {wasUpdated && (
                <>
                  <span className="text-xs text-fg-subtle">·</span>
                  <span className="text-xs text-fg-subtle">
                    Actualizado el{" "}
                    <time dateTime={lastModified}>
                      {formatArticleDate(lastModified)}
                    </time>
                  </span>
                </>
              )}
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
            className="prose prose-sm sm:prose max-w-none prose-headings:font-semibold prose-headings:text-fg prose-p:text-fg-muted prose-li:text-fg-muted prose-a:text-brand prose-strong:text-fg prose-code:rounded prose-code:bg-surface-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-xs prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:bg-surface-muted prose-pre:p-4 prose-pre:text-xs prose-table:border-collapse prose-th:border prose-th:border-outline-soft prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:text-xs prose-th:text-fg prose-td:border prose-td:border-outline-soft prose-td:px-3 prose-td:py-2 prose-td:text-xs prose-td:text-fg-muted [&_pre_code]:bg-transparent [&_pre_code]:p-0"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* FAQ — also emitted as FAQPage structured data */}
          {article.faqs && article.faqs.length > 0 && (
            <section className="mt-12 border-t border-outline-soft pt-8">
              <h2 className="mb-6 text-xl font-semibold text-fg">
                Preguntas frecuentes
              </h2>
              <dl className="space-y-6">
                {article.faqs.map((faq) => (
                  <div key={faq.question}>
                    <dt className="mb-1.5 text-base font-semibold text-fg">
                      {faq.question}
                    </dt>
                    <dd className="text-sm leading-relaxed text-fg-muted">
                      {faq.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* Topical cluster links */}
          {related.length > 0 && (
            <section className="mt-12 border-t border-outline-soft pt-8">
              <h2 className="mb-4 text-xl font-semibold text-fg">
                Sigue leyendo
              </h2>
              <ul className="space-y-3">
                {related.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/blog/${item.slug}`}
                      className="group block rounded-lg border border-outline-soft px-4 py-3 transition-colors hover:border-brand"
                    >
                      <span className="block text-sm font-medium text-fg group-hover:text-brand">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-fg-muted">
                        {item.excerpt}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

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

          {/* Chronological fallback when the article has no topical cluster */}
          {related.length === 0 && (prev || next) && (
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
              Simple*Factu — Servicio compatible con Veri*Factu (AEAT)
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
