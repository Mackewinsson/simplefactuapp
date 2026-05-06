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
        <h1 className="text-2xl font-semibold text-gray-900">{page.frontmatter.title}</h1>
        {page.frontmatter.description ? (
          <p className="mt-1 text-sm text-gray-600">{page.frontmatter.description}</p>
        ) : null}
      </header>
      <div
        className="prose prose-sm max-w-none prose-headings:scroll-mt-24 prose-pre:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100"
        dangerouslySetInnerHTML={{ __html: page.html }}
      />
    </>
  );
}
