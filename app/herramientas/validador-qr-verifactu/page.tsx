import type { Metadata } from "next";
import Link from "next/link";
import { publicRobots } from "@/lib/seo/robots";
import { canonicalUrl } from "@/lib/seo/site-url";
import { BrandWordmark } from "../../BrandWordmark";
import { QRValidatorClient } from "./QRValidatorClient";

export const metadata: Metadata = {
  title: "Validador QR Veri*Factu AEAT — Comprobador Gratis de Factura Electrónica",
  description:
    "Herramienta gratuita para comprobar y validar códigos QR Veri*Factu de la Agencia Tributaria. Decodifica NIF emisor, huella SHA-256, importe y verifica requisitos del RD 1007/2023.",
  robots: publicRobots,
  alternates: {
    canonical: canonicalUrl("/herramientas/validador-qr-verifactu"),
  },
  openGraph: {
    title: "Validador QR Veri*Factu AEAT — Comprobador Gratis de Factura Electrónica",
    description:
      "Decodifica y comprueba gratis cualquier código QR Veri*Factu conforme al RD 1007/2023 y la OM HAC/1177/2024.",
    url: canonicalUrl("/herramientas/validador-qr-verifactu"),
    siteName: "Simple*Factu",
    locale: "es_ES",
    type: "website",
  },
};

const toolSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Validador QR Veri*Factu AEAT",
  operatingSystem: "All",
  applicationCategory: "BusinessApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
  },
  description:
    "Comprobador en línea gratuito de códigos QR Veri*Factu para autónomos, gestorías y desarrolladores.",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Qué datos contiene el código QR de una factura Veri*Factu?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "El código QR contiene la URL de cotejo en la AEAT con el NIF del obligado emisor, número de serie, fecha de expedición, importe total y los primeros caracteres de la huella digital SHA-256.",
      },
    },
    {
      "@type": "Question",
      name: "¿Es obligatorio que el PDF de la factura lleve código QR Veri*Factu?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. El artículo 15 del Real Decreto 1007/2023 y la Orden HAC/1177/2024 exigen que todas las facturas emitidas por un SIF incluyan el código QR con el formato oficial de la AEAT.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo puede el cliente final verificar la factura en la AEAT?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Escaneando el código QR con la cámara del móvil o introduciendo los datos en la Sede Electrónica de la Agencia Tributaria.",
      },
    },
  ],
};

export default function QRValidatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([toolSchema, faqSchema]),
        }}
      />
      <div className="flex min-h-screen flex-col bg-surface">
        <header className="border-b border-outline-soft bg-surface">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <BrandWordmark />
            <nav className="flex items-center gap-2">
              <Link
                href="/blog"
                className="rounded px-3 py-1.5 text-sm text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg"
              >
                Blog
              </Link>
              <Link
                href="/docs"
                className="rounded px-3 py-1.5 text-sm text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg"
              >
                Documentación API
              </Link>
              <Link href="/sign-up" className="btn btn-sm btn-primary ml-2">
                Crear cuenta gratis
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
          <nav className="mb-6 flex items-center gap-1.5 text-xs text-fg-subtle">
            <Link href="/" className="hover:text-fg">
              Inicio
            </Link>
            <span>/</span>
            <span className="text-fg-muted">Herramientas</span>
            <span>/</span>
            <span className="text-fg-muted">Validador QR Veri*Factu</span>
          </nav>

          <div className="mb-8 text-center sm:text-left">
            <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
              Herramienta Gratuita SEO / AEAT
            </span>
            <h1 className="mt-3 text-3xl font-extrabold text-fg sm:text-4xl">
              Validador de Código QR Veri*Factu (AEAT)
            </h1>
            <p className="mt-2 text-base text-fg-muted max-w-2xl">
              Pega la URL del código QR o los parámetros de tu factura para decodificar la huella SHA-256, NIF emisor, fecha e importe según el <strong>RD 1007/2023</strong> y la <strong>OM HAC/1177/2024</strong>.
            </p>
          </div>

          <QRValidatorClient />

          {/* FAQ Accordion Section for SEO & Rich Snippets */}
          <section className="mt-16 rounded-2xl border border-outline-soft bg-surface-muted p-6 sm:p-8">
            <h2 className="text-xl font-bold text-fg mb-4">
              Preguntas Frecuentes sobre la Validación QR de Veri*Factu
            </h2>
            <div className="space-y-4">
              <details className="group border border-outline-soft rounded-lg bg-surface p-4">
                <summary className="font-semibold text-fg cursor-pointer hover:text-brand">
                  ¿Qué datos contiene el código QR de una factura Veri*Factu?
                </summary>
                <p className="mt-2 text-sm text-fg-muted leading-relaxed">
                  El código QR encodea la URL de cotejo en la sede electrónica de la AEAT (`https://www1.agenciatributaria.gob.es/wlpl/invi-valida/validaQR...`). Incluye el NIF del emisor, serie/número, fecha de expedición, importe total y la huella o huella parcial SHA-256.
                </p>
              </details>

              <details className="group border border-outline-soft rounded-lg bg-surface p-4">
                <summary className="font-semibold text-fg cursor-pointer hover:text-brand">
                  ¿Es obligatorio incluir el código QR en la factura PDF o impresa?
                </summary>
                <p className="mt-2 text-sm text-fg-muted leading-relaxed">
                  Sí, conforme al Reglamento de requisitos de los Sistemas Informáticos de Facturación (SIF), toda factura física o digital en PDF debe incluir la representación gráfica del código QR normalizado y la mención <em>&quot;VERI*FACTU&quot;</em> (si se usa el sistema de remisión en tiempo real).
                </p>
              </details>

              <details className="group border border-outline-soft rounded-lg bg-surface p-4">
                <summary className="font-semibold text-fg cursor-pointer hover:text-brand">
                  ¿Cómo integro Veri*Factu en mi propio software o aplicación?
                </summary>
                <p className="mt-2 text-sm text-fg-muted leading-relaxed">
                  Simple*Factu ofrece una API REST de ultra-baja latencia que genera las huellas encadenadas SHA-256, construye los mensajes XML SOAP y los envía directamente a la AEAT con tu certificado digital.
                </p>
              </details>
            </div>
          </section>

          {/* CTA Box */}
          <div className="mt-12 rounded-2xl bg-gradient-to-r from-brand/10 to-brand/5 border border-brand/20 p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-fg">
                ¿Necesitas automatizar Veri*Factu en tu programa?
              </h3>
              <p className="text-sm text-fg-muted mt-1">
                Conecta tu software con nuestra API en menos de 10 minutos. Olvídate del XML SOAP y mTLS.
              </p>
            </div>
            <Link href="/sign-up" className="btn btn-primary text-sm whitespace-nowrap">
              Empezar gratis
            </Link>
          </div>
        </main>

        <footer className="border-t border-outline-soft bg-surface py-6 text-center text-xs text-fg-subtle">
          Simple*Factu — Validador de marcado QR Veri*Factu AEAT
        </footer>
      </div>
    </>
  );
}
