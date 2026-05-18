import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://simplefactu.com";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/docs`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/docs/concepts`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/docs/quickstart`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/docs/authentication`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/docs/error-codes`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/docs/api-reference`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/legal/aviso-legal`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/legal/privacidad`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/legal/terminos`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/legal/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/legal/dpa`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/legal/cancelacion`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  return staticRoutes;
}
