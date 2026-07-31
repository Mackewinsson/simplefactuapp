import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Plus_Jakarta_Sans } from "next/font/google";
import { APP_DISPLAY_NAME } from "@/lib/branding";
import { siteRobots } from "@/lib/seo/robots";
import { getSiteUrl } from "@/lib/seo/site-url";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: APP_DISPLAY_NAME,
    template: `%s — ${APP_DISPLAY_NAME}`,
  },
  description: "Cumple Veri*Factu sin tocar AEAT — facturación y API para autónomos y empresas. Huellas, encadenamiento y envío SOAP gestionados por nosotros.",
  robots: siteRobots(),
  openGraph: {
    siteName: APP_DISPLAY_NAME,
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

/**
 * Root layout. Intentionally minimal: it sets up <html>, <body>, the Clerk
 * provider and global styles, then defers all chrome (header, banner,
 * footer, container) to nested layouts.
 *
 * The transactional app surface lives under the `(chrome)` route group, so
 * its layout — which calls `auth()` server-side — only runs for the routes
 * that need it. Public surfaces with their own chrome (`/docs`, `/sign-in`,
 * `/sign-up`) skip it, which keeps `/docs/[slug]` statically prerenderable.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={esES}>
      <html
        lang="es"
        className={`${GeistSans.variable} ${GeistMono.variable} ${plusJakartaSans.variable}`}
      >
        <body className="flex min-h-screen flex-col bg-surface font-sans text-fg antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

