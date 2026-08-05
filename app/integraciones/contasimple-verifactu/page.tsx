import type { Metadata } from "next";
import { IntegrationLanding } from "@/components/integraciones/IntegrationLanding";
import {
  buildIntegrationJsonLd,
  getIntegrationPage,
} from "@/lib/seo/integration-pages";
import { absoluteTitle } from "@/lib/branding";
import { publicRobots } from "@/lib/seo/robots";
import { canonicalUrl } from "@/lib/seo/site-url";

const page = getIntegrationPage("contasimple-verifactu")!;

export const metadata: Metadata = {
  title: absoluteTitle(page.metaTitle),
  description: page.metaDescription,
  robots: publicRobots,
  alternates: { canonical: canonicalUrl(page.path) },
  openGraph: {
    title: page.metaTitle,
    description: page.metaDescription,
    url: canonicalUrl(page.path),
    siteName: "Simple*Factu",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: page.metaTitle,
    description: page.metaDescription,
  },
};

export default function ContasimpleVerifactuIntegrationPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildIntegrationJsonLd(page)),
        }}
      />
      <IntegrationLanding page={page} />
    </>
  );
}
