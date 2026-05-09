import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  APP_DISPLAY_NAME,
  APP_DOCS_INDEX_DESCRIPTION,
  APP_DOCS_LABEL,
} from "@/lib/branding";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

/**
 * Lightweight Markdown loader for /docs.
 *
 * Each .md file under content/docs is a documentation page. Frontmatter
 * fields (title, description) are surfaced via getDocMeta; the body is
 * compiled with remark + GFM and returned as raw HTML for the page to
 * render with Tailwind's typography prose classes.
 *
 * Sidebar order is controlled by content/docs/meta.json → pages.
 */

const DOCS_DIR = path.join(process.cwd(), "content/docs");

export type DocFrontmatter = {
  title: string;
  description?: string;
};

export type DocPage = {
  slug: string;
  frontmatter: DocFrontmatter;
  html: string;
};

export type DocMeta = {
  slug: string;
  title: string;
  description?: string;
};

/** Slug used for the index file. Empty string maps to /docs. */
export const ROOT_SLUG = "index";

function readMeta(): { pages: string[] } {
  const file = path.join(DOCS_DIR, "meta.json");
  if (!fs.existsSync(file)) return { pages: [] };
  const raw = JSON.parse(fs.readFileSync(file, "utf8")) as { pages?: string[] };
  return { pages: Array.isArray(raw.pages) ? raw.pages : [] };
}

function fileForSlug(slug: string): string | null {
  const candidate = path.join(DOCS_DIR, `${slug}.md`);
  if (!fs.existsSync(candidate)) return null;
  // Cheap traversal guard. We never accept slugs with `..` or path separators.
  const resolved = path.resolve(candidate);
  if (!resolved.startsWith(path.resolve(DOCS_DIR))) return null;
  return resolved;
}

export async function getDocPage(slug: string | undefined): Promise<DocPage | null> {
  const realSlug = slug && slug.length > 0 ? slug : ROOT_SLUG;
  const file = fileForSlug(realSlug);
  if (!file) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);

  const processed = await remark().use(remarkGfm).use(remarkHtml).process(content);

  const html = String(processed).replaceAll("{{APP_DISPLAY_NAME}}", APP_DISPLAY_NAME);

  const title =
    realSlug === ROOT_SLUG
      ? APP_DOCS_LABEL
      : typeof data.title === "string"
        ? data.title
        : realSlug;
  const description =
    realSlug === ROOT_SLUG
      ? APP_DOCS_INDEX_DESCRIPTION
      : typeof data.description === "string"
        ? data.description
        : undefined;

  return {
    slug: realSlug,
    frontmatter: {
      title,
      description,
    },
    html,
  };
}

/** Sidebar items in the order declared in meta.json. */
export function listDocs(): DocMeta[] {
  const { pages } = readMeta();
  const items: DocMeta[] = [];
  for (const slug of pages) {
    const file = fileForSlug(slug);
    if (!file) continue;
    const { data } = matter(fs.readFileSync(file, "utf8"));
    const title =
      slug === ROOT_SLUG
        ? APP_DOCS_LABEL
        : typeof data.title === "string"
          ? data.title
          : slug;
    const description =
      slug === ROOT_SLUG
        ? APP_DOCS_INDEX_DESCRIPTION
        : typeof data.description === "string"
          ? data.description
          : undefined;
    items.push({
      slug,
      title,
      description,
    });
  }
  return items;
}

export function listDocSlugs(): string[] {
  const { pages } = readMeta();
  return pages.filter((slug) => slug !== ROOT_SLUG);
}
