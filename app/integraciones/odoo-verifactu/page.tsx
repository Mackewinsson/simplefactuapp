import type { Metadata } from "next";
import { IntegrationLanding } from "@/components/integraciones/IntegrationLanding";
import {
  buildIntegrationJsonLd,
  getIntegrationPage,
} from "@/lib/seo/integration-pages";
import { publicRobots } from "@/lib/seo/robots";
import { canonicalUrl } from "@/lib/seo/site-url";

const page = getIntegrationPage("odoo-verifactu")!;

export const metadata: Metadata = {
  title: page.metaTitle,
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

export default function OdooVerifactuIntegrationPage() {
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
