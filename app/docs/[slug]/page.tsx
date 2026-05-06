import { notFound } from "next/navigation";
import { getDocPage, listDocSlugs } from "@/lib/docs/source";
import { DocBody } from "../DocBody";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return listDocSlugs().map((slug) => ({ slug }));
}

export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getDocPage(slug);
  if (!page) notFound();
  return <DocBody page={page} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getDocPage(slug);
  if (!page) return { title: "Not found" };
  return {
    title: `${page.frontmatter.title} — SimpleFactu Docs`,
    description: page.frontmatter.description,
  };
}
