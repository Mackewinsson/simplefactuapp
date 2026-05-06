import { notFound } from "next/navigation";
import { getDocPage } from "@/lib/docs/source";
import { DocBody } from "./DocBody";

export const dynamic = "force-static";

export default async function DocsIndexPage() {
  const page = await getDocPage(undefined);
  if (!page) notFound();
  return <DocBody page={page} />;
}

export async function generateMetadata() {
  const page = await getDocPage(undefined);
  if (!page) return { title: "SimpleFactu Docs" };
  return {
    title: `${page.frontmatter.title} — SimpleFactu Docs`,
    description: page.frontmatter.description,
  };
}
