import type { Metadata } from "next";
import Link from "next/link";
import { IntegrationChrome } from "@/components/integraciones/IntegrationChrome";
import {
  buildIntegrationsHubJsonLd,
  INTEGRATION_PAGES,
} from "@/lib/seo/integration-pages";
import { absoluteTitle } from "@/lib/branding";
import { publicRobots } from "@/lib/seo/robots";
import { canonicalUrl } from "@/lib/seo/site-url";

const title = "Integraciones Veri*Factu API — FactuSOL, ContaSimple, Odoo";
const description =
  "Conectores API REST para cumplir Veri*Factu desde FactuSOL, ContaSimple, Odoo u otro ERP. Sin SOAP ni mTLS en tu código. Docs y sandbox gratis.";

export const metadata: Metadata = {
  title: absoluteTitle(title),
  description,
  robots: publicRobots,
  alternates: { canonical: canonicalUrl("/integraciones") },
  openGraph: {
    title,
    description,
    url: canonicalUrl("/integraciones"),
    siteName: "Simple*Factu",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function IntegracionesHubPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildIntegrationsHubJsonLd()),
        }}
      />
      <IntegrationChrome>
        <nav className="mb-6 flex items-center gap-1.5 text-xs text-fg-subtle">
          <Link href="/" className="hover:text-fg">
            Inicio
          </Link>
          <span>/</span>
          <span className="text-fg-muted">Integraciones</span>
        </nav>

        <div className="mb-10">
          <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            API Veri*Factu · Developers
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-fg font-display sm:text-4xl">
            Integraciones Veri*Factu por API
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-fg-muted">
            Conecta FactuSOL, ContaSimple, Odoo o tu ERP a la AEAT con una API
            REST. Nosotros gestionamos huella SHA-256, SOAP VeriFactuSOAP y CSV.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {INTEGRATION_PAGES.map((page) => (
            <Link
              key={page.slug}
              href={page.path}
              className="group rounded-xl border border-outline-soft/60 bg-surface-muted/30 p-5 transition-all hover:border-brand/40 hover:bg-surface-muted/60"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                {page.navLabel}
              </p>
              <h2 className="mt-2 text-base font-bold text-fg font-display group-hover:text-brand">
                {page.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                {page.intro.slice(0, 120)}…
              </p>
              <span className="mt-4 inline-block text-sm font-medium text-brand">
                Ver integración →
              </span>
            </Link>
          ))}
        </div>

        <section className="mt-14 rounded-2xl border border-outline-soft bg-surface-muted/40 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-fg font-display">
            ¿Tu software no está en la lista?
          </h2>
          <p className="mt-2 text-sm text-fg-muted">
            Cualquier sistema que pueda hacer HTTP puede enviar facturas a
            Simple*Factu. Empieza por el{" "}
            <Link href="/docs/quickstart" className="text-brand hover:underline">
              quickstart
            </Link>{" "}
            o la{" "}
            <Link
              href="/docs/api-reference"
              className="text-brand hover:underline"
            >
              referencia API
            </Link>
            .
          </p>
        </section>
      </IntegrationChrome>
    </>
  );
}
