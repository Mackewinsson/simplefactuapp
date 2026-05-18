import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://simplefactu.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/docs", "/legal/"],
        disallow: ["/invoices/", "/admin/", "/settings/", "/sign-in", "/sign-up", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
