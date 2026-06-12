const DEFAULT_ORIGIN = "https://simplefactu.com";

/** Canonical public origin (always https; apex domain in production). */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_ORIGIN;
  try {
    const url = new URL(raw);
    url.protocol = "https:";
    if (process.env.VERCEL_ENV === "production") {
      url.hostname = "simplefactu.com";
    }
    return url.origin;
  } catch {
    return DEFAULT_ORIGIN;
  }
}

/** Absolute canonical URL for a path (no trailing slash on `/`). */
export function canonicalUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
