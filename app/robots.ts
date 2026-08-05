import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/blog", "/docs", "/legal/"],
        disallow: [
          "/invoices",
          "/invoices/",
          "/admin",
          "/admin/",
          "/settings",
          "/settings/",
          "/customers",
          "/customers/",
          "/products",
          "/products/",
          "/dashboard",
          "/dashboard/",
          "/partner",
          "/partner/",
          "/onboarding",
          "/welcome",
          "/welcome/",
          "/sign-in",
          "/sign-up",
          "/admin-access-denied",
          "/partner-access-denied",
          "/api/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}

