import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { BrandWordmark } from "./BrandWordmark";
import { HeroTabs } from "./HeroTabs";
import { LeadForm } from "./LeadForm";
import { BlogCarousel } from "./BlogCarousel";
import { articles } from "@/lib/blog/articles";

export default async function PublicHomePage() {
  const { userId } = await auth();
  if (userId) redirect("/invoices");

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {/* ── Public header ─────────────────────────────── */}
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
              href="/docs"
              className="hidden rounded px-3 py-1.5 text-sm text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg sm:inline-flex"
            >
              Docs
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

      <main className="flex flex-1 flex-col">
        {/* ── Hero ──────────────────────────────────────── */}
        <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-24">
          {/* Compliance pill */}
          <div className="mb-8 flex w-fit max-w-full items-start gap-2 rounded-xl border border-outline-soft bg-surface-muted px-3 py-1.5 text-xs font-medium text-fg-subtle">
            <span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-fg-subtle" />
            <span>Compatible con Veri·Factu — RD&nbsp;1007/2023&nbsp;·&nbsp;OM&nbsp;HAC/1177/2024</span>
          </div>

          <HeroTabs />
        </section>

        {/* ── Divider ───────────────────────────────────── */}
        <div className="border-t border-outline-soft" />

        {/* ── Cómo funciona ─────────────────────────────── */}
        <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="mb-10 text-xs font-medium uppercase tracking-widest text-fg-subtle">
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
        <div className="border-t border-outline-soft" />

        {/* ── Blog / Artículos ──────────────────────────── */}
        <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-widest text-fg-subtle">
                Blog
              </p>
              <h2 className="text-xl font-semibold text-fg sm:text-2xl">
                Guías sobre Veri*Factu
              </h2>
            </div>
            <Link
              href="/blog"
              className="shrink-0 text-sm text-fg-muted hover:text-fg"
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
        <div className="border-t border-outline-soft" />

        {/* ── Contacto / lead form ──────────────────────── */}
        <section id="contacto" className="mx-auto w-full max-w-lg px-4 py-14 sm:px-6 sm:py-20">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold text-fg">¿Tienes preguntas?</h2>
            <p className="mt-2 text-sm text-fg-muted">
              Cuéntanos tu caso y te respondemos en menos de 24&nbsp;h. Sin compromisos.
            </p>
          </div>
          <LeadForm />
        </section>
      </main>

      {/* ── Minimal public footer ─────────────────────── */}
      <footer className="border-t border-outline-soft bg-surface">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 text-xs text-fg-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>
            Simple·Factu &mdash; Servicio compatible con Veri·Factu (AEAT)
          </span>
          <nav className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/blog" className="hover:text-fg">Blog</Link>
            <Link href="/docs" className="hover:text-fg">Docs</Link>
            <Link href="/docs/api-reference" className="hover:text-fg">API Reference</Link>
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
    <div>
      <span className="text-xs font-medium tabular-nums text-fg-subtle">
        {number}
      </span>
      <h3 className="mt-2 text-sm font-semibold text-fg">{title}</h3>
      <p className="mt-1.5 text-sm text-fg-muted">{body}</p>
    </div>
  );
}
