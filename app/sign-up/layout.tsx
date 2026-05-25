import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo/robots";

export const metadata: Metadata = privatePageMetadata;

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
