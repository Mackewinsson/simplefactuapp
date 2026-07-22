import type { MetadataRoute } from "next";
import { articles } from "@/lib/blog/articles";
import { getSiteUrl } from "@/lib/seo/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const staticLastMod = new Date("2026-06-12T00:00:00.000Z");

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: staticLastMod, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/docs`, lastModified: staticLastMod, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/docs/concepts`, lastModified: staticLastMod, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/docs/quickstart`, lastModified: staticLastMod, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/docs/gestoria`, lastModified: staticLastMod, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/docs/authentication`, lastModified: staticLastMod, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/docs/error-codes`, lastModified: staticLastMod, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/docs/api-reference`, lastModified: staticLastMod, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/blog`, lastModified: staticLastMod, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/legal/aviso-legal`, lastModified: staticLastMod, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/legal/privacidad`, lastModified: staticLastMod, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/legal/terminos`, lastModified: staticLastMod, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/legal/cookies`, lastModified: staticLastMod, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/legal/dpa`, lastModified: staticLastMod, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/legal/cancelacion`, lastModified: staticLastMod, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/legal/declaracion-responsable`, lastModified: staticLastMod, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/legal/accesibilidad`, lastModified: staticLastMod, changeFrequency: "yearly", priority: 0.3 },
  ];

  const blogRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${base}/blog/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...blogRoutes];
}

