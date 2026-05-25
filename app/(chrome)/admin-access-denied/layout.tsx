import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo/robots";

export const metadata: Metadata = privatePageMetadata;

export default function AdminAccessDeniedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
