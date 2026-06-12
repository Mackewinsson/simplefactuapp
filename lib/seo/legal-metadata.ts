import type { Metadata } from "next";
import { appDocumentTitle } from "@/lib/branding";
import { publicRobots } from "@/lib/seo/robots";
import { canonicalUrl } from "@/lib/seo/site-url";

export function legalPageMetadata(title: string, path: string): Metadata {
  return {
    title: appDocumentTitle(title),
    robots: publicRobots,
    alternates: { canonical: canonicalUrl(path) },
  };
}
