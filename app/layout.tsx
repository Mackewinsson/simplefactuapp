import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import { AppNav } from "./AppNav";
import { HeaderUserArea } from "./HeaderUserArea";
import { Footer } from "./Footer";
import { OnboardingBanner } from "./OnboardingBanner";
import "./globals.css";

export const metadata: Metadata = {
  title: "SimpleFactu",
  description: "Facturación sencilla con Verifactu (AEAT)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={esES}>
      <html lang="es">
        <body className="flex min-h-screen flex-col bg-gray-50 text-gray-900 antialiased">
          <header className="border-b border-gray-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3">
              <div className="flex items-center gap-8">
                <span className="text-lg font-semibold text-gray-900">
                  SimpleFactu
                </span>
                <AppNav />
              </div>
              <div className="flex items-center gap-3">
                <HeaderUserArea />
              </div>
            </div>
          </header>
          <OnboardingBanner />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
