import Link from "next/link";
import type { IntegrationPageContent } from "@/lib/seo/integration-pages";
import { IntegrationChrome } from "./IntegrationChrome";

export function IntegrationLanding({ page }: { page: IntegrationPageContent }) {
  return (
    <IntegrationChrome>
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-fg-subtle">
        <Link href="/" className="hover:text-fg">
          Inicio
        </Link>
        <span>/</span>
        <Link href="/integraciones" className="hover:text-fg">
          Integraciones
        </Link>
        <span>/</span>
        <span className="text-fg-muted">{page.navLabel}</span>
      </nav>

      <div className="mb-10">
        <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
          {page.badge}
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-fg font-display sm:text-4xl">
          {page.h1}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-fg-muted">
          {page.intro}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/sign-up" className="btn btn-primary">
            Probar API gratis
          </Link>
          <Link href="/docs/quickstart" className="btn btn-secondary btn-sm">
            Ver quickstart
          </Link>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="text-xl font-bold text-fg font-display">
          Qué resuelve esta integración
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {page.features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-outline-soft/60 bg-surface-muted/40 p-4"
            >
              <h3 className="text-sm font-bold text-fg font-display">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-bold text-fg font-display">
          Cómo conectar en 3 pasos
        </h2>
        <ol className="mt-6 space-y-4">
          {page.steps.map((step, index) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-xl border border-outline-soft/50 p-4"
            >
              <span className="font-mono text-xs font-bold text-fg-subtle">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-sm font-bold text-fg">{step.title}</h3>
                <p className="mt-1 text-sm text-fg-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-bold text-fg font-display">{page.codeTitle}</h2>
        <pre className="mt-4 overflow-x-auto rounded-xl border border-outline-soft bg-surface-muted p-4 text-xs leading-relaxed text-fg">
          <code>{page.codeSample}</code>
        </pre>
        <p className="mt-3 text-sm text-fg-muted">
          Documentación completa en{" "}
          <Link href="/docs" className="font-medium text-brand hover:underline">
            /docs
          </Link>{" "}
          y referencia OpenAPI en{" "}
          <Link
            href="/docs/api-reference"
            className="font-medium text-brand hover:underline"
          >
            /docs/api-reference
          </Link>
          .
        </p>
      </section>

      {page.comparisonRows && page.comparisonRows.length > 0 ? (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-fg font-display">
            {page.comparisonTitle}
          </h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-outline-soft">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="bg-surface-muted text-fg">
                <tr>
                  <th className="px-4 py-3 font-semibold">Criterio</th>
                  <th className="px-4 py-3 font-semibold">
                    {page.comparisonLeftHeader}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {page.comparisonRightHeader}
                  </th>
                </tr>
              </thead>
              <tbody>
                {page.comparisonRows.map((row) => (
                  <tr key={row.criterion} className="border-t border-outline-soft">
                    <td className="px-4 py-3 font-medium text-fg">
                      {row.criterion}
                    </td>
                    <td className="px-4 py-3 text-fg-muted">{row.left}</td>
                    <td className="px-4 py-3 text-fg-muted">{row.right}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="mb-12 rounded-2xl border border-outline-soft bg-surface-muted p-6 sm:p-8">
        <h2 className="mb-4 text-xl font-bold text-fg font-display">
          Preguntas frecuentes
        </h2>
        <div className="space-y-3">
          {page.faqs.map((faq) => (
            <details
              key={faq.question}
              className="rounded-lg border border-outline-soft bg-surface p-4"
            >
              <summary className="cursor-pointer font-semibold text-fg hover:text-brand">
                {faq.question}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <div className="mb-8 rounded-2xl border border-brand/20 bg-gradient-to-r from-brand/10 to-brand/5 p-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-fg font-display">
              Empieza la integración hoy
            </h2>
            <p className="mt-1 text-sm text-fg-muted">
              Sandbox gratis. Sin montar SOAP ni mTLS contra la AEAT.
            </p>
          </div>
          <Link href="/sign-up" className="btn btn-primary whitespace-nowrap">
            Crear cuenta
          </Link>
        </div>
      </div>

      <p className="text-sm text-fg-muted">
        También te puede interesar:{" "}
        <Link
          href={`/blog/${page.relatedBlogSlug}`}
          className="font-medium text-brand hover:underline"
        >
          {page.relatedBlogLabel}
        </Link>
        {" · "}
        <Link href="/integraciones" className="font-medium text-brand hover:underline">
          Todas las integraciones
        </Link>
      </p>
    </IntegrationChrome>
  );
}
