import type { Metadata } from "next";
import Link from "next/link";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
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
            <div className="mx-auto flex max-w-4xl items-center justify-between gap-8 px-4 py-3">
              <div className="flex items-center gap-8">
                <span className="text-lg font-semibold text-gray-900">
                  SimpleFactu
                </span>
                <nav className="flex gap-6">
                  <Link href="/" className="text-gray-600 hover:text-gray-900">
                    Home
                  </Link>
                  <Link href="/invoices" className="text-gray-600 hover:text-gray-900">
                    Invoices
                  </Link>
                  <Link href="/invoices/new" className="text-gray-600 hover:text-gray-900">
                    New Invoice
                  </Link>
                </nav>
              </div>
              <SignedOut>
                <SignInButton />
                <SignUpButton />
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </header>
          <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
