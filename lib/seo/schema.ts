import { canonicalUrl, getSiteUrl } from "./site-url";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildOrganizationSchema() {
  const base = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${base}/#organization`,
    name: "Simple*Factu",
    url: base,
    logo: {
      "@type": "ImageObject",
      url: `${base}/og-image.png`,
    },
    sameAs: [
      "https://github.com/Mackewinsson/simplefactu",
      "https://github.com/Mackewinsson/simplefactuapp",
    ],
    description:
      "Infraestructura API y Software de Facturación Electrónica Veri*Factu para Autónomos, Pymes y Desarrolladores conforme al RD 1007/2023 y OM HAC/1177/2024.",
  };
}

export function buildSoftwareApplicationSchema() {
  const base = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${base}/#software`,
    name: "Simple*Factu Veri*Factu API",
    operatingSystem: "Web-based",
    applicationCategory: "BusinessApplication",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: "0.00",
      highPrice: "99.00",
      offerCount: "3",
    },
    publisher: {
      "@type": "Organization",
      "@id": `${base}/#organization`,
    },
    description:
      "Software SIF y API de emisión Veri*Factu homologada para el envío en tiempo real de registros de facturación con huella SHA-256 a la AEAT.",
  };
}

export function buildArticleSchema(params: {
  title: string;
  description: string;
  slug: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
}) {
  const base = getSiteUrl();
  const url = canonicalUrl(`/blog/${params.slug}`);

  return {
    "@context": "https://schema.org",
    // BlogPosting unlocks article rich results; TechArticle keeps the
    // technical how-to signal for Veri*Factu / AEAT guides.
    "@type": ["BlogPosting", "TechArticle"],
    "@id": `${url}#article`,
    isPartOf: {
      "@type": "WebPage",
      "@id": url,
    },
    headline: params.title,
    description: params.description,
    mainEntityOfPage: url,
    datePublished: params.datePublished,
    dateModified: params.dateModified ?? params.datePublished,
    author: {
      "@type": "Organization",
      name: params.authorName ?? "Equipo de Seguridad y Fiscalidad Simple*Factu",
      url: base,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${base}/#organization`,
      name: "Simple*Factu",
      logo: {
        "@type": "ImageObject",
        url: `${base}/og-image.png`,
      },
    },
    about: [
      {
        "@type": "Thing",
        name: "Veri*Factu",
        sameAs: "https://es.wikipedia.org/wiki/Veri*Factu",
      },
      {
        "@type": "Thing",
        name: "Agencia Estatal de Administración Tributaria",
        sameAs: "https://www.agenciatributaria.es",
      },
      {
        "@type": "Legislation",
        name: "Real Decreto 1007/2023",
      },
      {
        "@type": "Legislation",
        name: "Orden HAC/1177/2024",
      },
    ],
  };
}

export function buildFAQSchema(faqs: FAQItem[]) {
  if (!faqs || faqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : canonicalUrl(item.url),
    })),
  };
}
