import type { ReactNode } from "react";
import type { Metadata } from "next";
import { listDocs, ROOT_SLUG } from "@/lib/docs/source";
import { DocsShell } from "./DocsShell";
import { publicRobots } from "@/lib/seo/robots";

export const metadata: Metadata = {
  robots: publicRobots,
};

/**
 * Layout for /docs/*.
 *
 * Shell (sidebar + content) is a client component so API reference can avoid
 * transform/backdrop-filter wrappers that break Scalar’s fixed overlays.
 * ChromeSlot opts /docs out of the root constrained <main> — see ChromeSlot.
 */
export default function DocsLayout({ children }: { children: ReactNode }) {
  const pages = listDocs();

  return (
    <DocsShell pages={pages} rootSlug={ROOT_SLUG}>
      {children}
    </DocsShell>
  );
}
