import type { DocPage } from "@/lib/docs/source";

/**
 * Renders the compiled HTML returned by `lib/docs/source` inside a
 * Tailwind-typography `prose` block. Server-rendered, no client JS.
 *
 * The HTML comes from remark-html which sanitizes by default; we
 * therefore trust it. If we ever switch to MDX with custom components,
 * this is the place to swap in the renderer.
 */
export function DocBody({ page }: { page: DocPage }) {
  return (
    <>
      <header className="not-prose mb-6">
        <h1 className="text-2xl font-semibold text-fg">{page.frontmatter.title}</h1>
        {page.frontmatter.description ? (
          <p className="mt-1 text-sm text-fg-muted">{page.frontmatter.description}</p>
        ) : null}
      </header>
      <div
        className="prose prose-sm max-w-none prose-headings:scroll-mt-24 prose-a:text-accent prose-pre:rounded prose-pre:bg-code prose-pre:text-code-foreground"
        dangerouslySetInnerHTML={{ __html: page.html }}
      />
    </>
  );
}
