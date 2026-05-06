import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import "./globals.css";

export const metadata: Metadata = {
  title: "SimpleFactu",
  description: "Facturación sencilla con Verifactu (AEAT)",
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
      <html lang="es">
        <body className="flex min-h-screen flex-col bg-gray-50 text-gray-900 antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
