import { notFound } from "next/navigation";
import { APP_DOCS_LABEL } from "@/lib/branding";
import { getDocPage } from "@/lib/docs/source";
import { publicRobots } from "@/lib/seo/robots";
import { canonicalUrl } from "@/lib/seo/site-url";
import { DocBody } from "./DocBody";

export const dynamic = "force-static";

export default async function DocsIndexPage() {
  const page = await getDocPage(undefined);
  if (!page) notFound();
  return <DocBody page={page} />;
}

export async function generateMetadata() {
  const page = await getDocPage(undefined);
  if (!page) return { title: APP_DOCS_LABEL };
  return {
    title: APP_DOCS_LABEL,
    description: page.frontmatter.description,
    robots: publicRobots,
    alternates: { canonical: canonicalUrl("/docs") },
  };
}
