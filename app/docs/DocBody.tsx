import Link from "next/link";
import type { DocMeta, DocPage, DocTocItem } from "@/lib/docs/source";
import { getDocNeighbors, ROOT_SLUG } from "@/lib/docs/source";

function DocToc({ items }: { items: DocTocItem[] }) {
  if (items.length < 3) return null;
  return (
    <nav
      aria-label="En esta página"
      className="not-prose mb-8 rounded-xl border border-outline-soft/65 bg-surface-muted/40 px-4 py-3"
    >
      <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-fg-subtle">
        En esta página
      </p>
      <ul className="space-y-1.5 text-xs font-medium text-fg-muted">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? "pl-3" : undefined}>
            <a href={`#${item.id}`} className="hover:text-accent transition-colors">
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function docHref(meta: DocMeta): string {
  return meta.slug === ROOT_SLUG ? "/docs" : `/docs/${meta.slug}`;
}

function DocPrevNext({ slug }: { slug: string }) {
  const { prev, next } = getDocNeighbors(slug);
  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Navegación entre guías"
      className="not-prose mt-10 flex flex-col gap-3 border-t border-outline-soft/65 pt-6 sm:flex-row sm:justify-between"
    >
      {prev ? (
        <Link
          href={docHref(prev)}
          className="group rounded-xl border border-outline-soft/65 bg-surface-muted/30 px-4 py-3 text-left transition-colors hover:border-accent-outline/40 hover:bg-accent/5 sm:max-w-[48%]"
        >
          <span className="block text-[10px] font-black uppercase tracking-wider text-fg-subtle">
            Anterior
          </span>
          <span className="mt-0.5 block text-sm font-bold text-fg group-hover:text-accent">
            ← {prev.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={docHref(next)}
          className="group rounded-xl border border-outline-soft/65 bg-surface-muted/30 px-4 py-3 text-right transition-colors hover:border-accent-outline/40 hover:bg-accent/5 sm:ml-auto sm:max-w-[48%]"
        >
          <span className="block text-[10px] font-black uppercase tracking-wider text-fg-subtle">
            Siguiente
          </span>
          <span className="mt-0.5 block text-sm font-bold text-fg group-hover:text-accent">
            {next.title} →
          </span>
        </Link>
      ) : null}
    </nav>
  );
}

/**
 * Renders the compiled HTML returned by `lib/docs/source` inside a
 * Tailwind-typography `prose` block. Server-rendered, no client JS.
 *
 * The HTML comes from rehype-stringify; we therefore trust it. If we ever
 * switch to MDX with custom components, this is the place to swap in the renderer.
 */
export function DocBody({ page }: { page: DocPage }) {
  return (
    <div className="font-sans">
      <header className="not-prose mb-6 pb-6 border-b border-outline-soft/65">
        <h1 className="text-3xl font-black tracking-tight text-fg">{page.frontmatter.title}</h1>
        {page.frontmatter.description ? (
          <p className="mt-2 text-sm text-fg-muted leading-relaxed font-sans font-medium">
            {page.frontmatter.description}
          </p>
        ) : null}
      </header>
      <DocToc items={page.toc} />
      <div
        className="prose prose-sm max-w-none prose-headings:scroll-mt-24 prose-a:text-accent prose-a:font-bold hover:prose-a:underline prose-headings:font-display prose-headings:font-black prose-headings:tracking-tight prose-headings:text-fg prose-pre:rounded-2xl prose-pre:bg-code prose-pre:text-code-foreground prose-pre:border prose-pre:border-outline-soft/10 prose-pre:shadow-md prose-pre:p-5 prose-pre:font-mono prose-pre:text-sm prose-code:font-mono prose-code:text-xs prose-code:bg-surface-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-lg prose-code:border prose-code:border-outline-soft/50 prose-code:before:content-none prose-code:after:content-none prose-strong:text-fg prose-strong:font-bold leading-relaxed text-fg-muted [&_pre_code]:bg-transparent [&_pre_code]:border-none [&_pre_code]:p-0 [&_pre_code]:text-inherit"
        dangerouslySetInnerHTML={{ __html: page.html }}
      />
      <DocPrevNext slug={page.slug} />
    </div>
  );
}
