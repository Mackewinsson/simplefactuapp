import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo/robots";

export const metadata: Metadata = privatePageMetadata;

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
