import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { APP_DISPLAY_NAME } from "@/lib/branding";
import "./globals.css";

export const metadata: Metadata = {
  title: APP_DISPLAY_NAME,
  description: "Cumple Veri\u00b7Factu sin tocar AEAT \u2014 facturaci\u00f3n y API para aut\u00f3nomos y empresas. Huellas, encadenamiento y env\u00edo SOAP gestionados por nosotros.",
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
      <html lang="es" className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <body className="flex min-h-screen flex-col bg-surface font-sans text-fg antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
