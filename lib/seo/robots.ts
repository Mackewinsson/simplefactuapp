import type { Metadata } from "next";

/** True only on the Vercel Production deployment (simplefactu.com). */
export function isProductionSite(): boolean {
  return process.env.VERCEL_ENV === "production";
}

export const publicRobots: NonNullable<Metadata["robots"]> = {
  index: true,
  follow: true,
  googleBot: { index: true, follow: true },
};

export const privateRobots: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

/** Default for the public marketing site; preview/staging stays out of Google. */
export function siteRobots(): NonNullable<Metadata["robots"]> {
  return isProductionSite() ? publicRobots : privateRobots;
}

export const privatePageMetadata: Metadata = {
  robots: privateRobots,
};
