import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { BrandWordmark } from "./BrandWordmark";
import { HeroTabs } from "./HeroTabs";
import { LeadForm } from "./LeadForm";
import { BlogCarousel } from "./BlogCarousel";
import { articles } from "@/lib/blog/articles";
import { publicRobots } from "@/lib/seo/robots";

export const metadata: Metadata = {
  title: "Simple*Factu — Veri*Factu para autónomos y pymes",
  description:
    "Cumple Veri*Factu sin tocar AEAT: facturación, certificado digital, envío a Hacienda y PDF con QR. Para autónomos, pymes y gestorías.",
  robots: publicRobots,
  alternates: {
    canonical: "https://simplefactu.com",
  },
};

export default async function PublicHomePage() {
  const { userId } = await auth();
  if (userId) redirect("/invoices");

  return (
    <div className="flex min-h-screen flex-col premium-glow-bg">
      {/* ── Public header ─────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-outline-soft/80 bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <BrandWordmark />
          <nav className="flex items-center gap-1 font-display">
            <Link
              href="/blog"
              className="hidden rounded px-3 py-1.5 text-sm text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg sm:inline-flex"
            >
              Blog
            </Link>
            <Link
              href="/docs"
              className="hidden rounded px-3 py-1.5 text-sm text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg sm:inline-flex"
            >
              Documentación
            </Link>
            <Link
              href="/sign-in"
              className="hidden rounded px-3 py-1.5 text-sm text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg sm:inline-flex"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/sign-up"
              className="btn btn-sm btn-primary sm:ml-2"
            >
              Crear cuenta
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col">
        {/* ── Hero ──────────────────────────────────────── */}
        <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-24 animate-fade-in-up">
          {/* Compliance pill */}
          <div className="mb-8 flex w-fit max-w-full items-start gap-2 rounded-xl border border-outline-soft/80 bg-surface-muted/65 px-3 py-1.5 text-xs font-semibold text-fg-subtle font-display shadow-sm">
            <span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent animate-pulse" />
            <span>Compatible con Veri·Factu — RD&nbsp;1007/2023&nbsp;·&nbsp;OM&nbsp;HAC/1177/2024</span>
          </div>

          <HeroTabs />
        </section>

        {/* ── Divider ───────────────────────────────────── */}
        <div className="border-t border-outline-soft/50" />

        {/* ── Cómo funciona ─────────────────────────────── */}
        <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16 animate-fade-in-up delay-100">
          <p className="mb-10 text-xs font-bold uppercase tracking-widest text-fg-subtle font-display">
            Cómo funciona
          </p>
          <div className="grid gap-8 sm:grid-cols-3">
            <Step
              number="01"
              title="Conecta tu certificado"
              body="Sube tu certificado FNMT (.pfx). Queda cifrado con AES-256-GCM; nunca sale del servidor."
            />
            <Step
              number="02"
              title="Crea la factura"
              body="Completa los datos de emisor, destinatario e importes. La app valida el desglose IVA antes de enviarlo."
            />
            <Step
              number="03"
              title="AEAT lo recibe y firma"
              body="Enviamos el XML SOAP firmado con mTLS. AEAT devuelve CSV y huella. Tú te quedas el PDF con QR."
            />
          </div>
        </section>

        {/* ── Divider ───────────────────────────────────── */}
        <div className="border-t border-outline-soft/50" />

        {/* ── Blog / Artículos ──────────────────────────── */}
        <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16 animate-fade-in-up delay-200">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-fg-subtle font-display">
                Blog
              </p>
              <h2 className="text-xl font-bold text-fg font-display tracking-tight sm:text-2xl">
                Guías sobre Veri*Factu
              </h2>
            </div>
            <Link
              href="/blog"
              className="shrink-0 text-sm font-medium text-fg-muted hover:text-fg font-display"
            >
              Ver todos →
            </Link>
          </div>
          <BlogCarousel
            articles={[...articles]
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              .map(({ slug, title, excerpt, date, readingMinutes, tags }) => ({
                slug,
                title,
                excerpt,
                date,
                readingMinutes,
                tags,
              }))}
          />
        </section>

        {/* ── Divider ───────────────────────────────────── */}
        <div className="border-t border-outline-soft/50" />

        {/* ── Contacto / lead form ──────────────────────── */}
        <section id="contacto" className="mx-auto w-full max-w-lg px-4 py-14 sm:px-6 sm:py-20 animate-fade-in-up delay-300">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-fg font-display tracking-tight">¿Tienes preguntas?</h2>
            <p className="mt-2 text-sm text-fg-muted">
              Cuéntanos tu caso y te respondemos en menos de 24&nbsp;h. Sin compromisos.
            </p>
          </div>
          <LeadForm />
        </section>
      </main>

      {/* ── Minimal public footer ─────────────────────── */}
      <footer className="relative z-10 border-t border-outline-soft/80 bg-surface/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 text-xs text-fg-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>
            Simple·Factu &mdash; Servicio compatible con Veri·Factu (AEAT)
          </span>
          <nav className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/blog" className="hover:text-fg">Blog</Link>
            <Link href="/docs" className="hover:text-fg">Documentación</Link>
            <Link href="/docs/api-reference" className="hover:text-fg">Referencia API</Link>
            <Link href="/legal/aviso-legal" className="hover:text-fg">Aviso legal</Link>
            <Link href="/legal/privacidad" className="hover:text-fg">Privacidad</Link>
            <Link href="/legal/terminos" className="hover:text-fg">Términos</Link>
            <Link href="/legal/cookies" className="hover:text-fg">Cookies</Link>
            <Link href="/legal/dpa" className="hover:text-fg">DPA</Link>
            <Link href="/legal/cancelacion" className="hover:text-fg">Cancelación</Link>
            <Link href="/legal/declaracion-responsable" className="hover:text-fg">Declaración Veri*Factu</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function Step({
  number,
  title,
  body,
}: {
  number: string;
  title: string;
  body: string;
}) {
  return (
    <div className="group rounded-xl border border-outline-soft/40 bg-surface/40 p-5 hover:bg-surface/90 hover:border-outline-soft/80 hover:shadow-md transition-all duration-300">
      <span className="text-xs font-bold font-mono text-fg-subtle bg-surface-muted px-2 py-0.5 rounded">
        {number}
      </span>
      <h3 className="mt-4 text-base font-bold text-fg font-display tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-fg-muted leading-relaxed">{body}</p>
    </div>
  );
}

