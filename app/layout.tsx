import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { AppNav } from "./AppNav";
import { HeaderUserArea } from "./HeaderUserArea";
import "./globals.css";

export const metadata: Metadata = {
  title: "SimpleFactu",
  description: "Simple invoices",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
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
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
