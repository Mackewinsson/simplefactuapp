import type { ReactNode } from "react";
import { BrandWordmark } from "../BrandWordmark";
import { AppNav } from "../AppNav";
import { HeaderUserArea } from "../HeaderUserArea";
import { Footer } from "../Footer";
import { OnboardingBanner } from "../OnboardingBanner";
import { OnboardingRedirect } from "./OnboardingRedirect";

/**
 * Layout for the authenticated/transactional surface of the app: header
 * with primary nav + user area, onboarding progress banner and footer.
 *
 * Lives in a route group so that public surfaces with their own chrome —
 * `/docs/*` (own header + sidebar), `/sign-in`, `/sign-up` (Clerk widgets) —
 * are not nested under it. This is critical because the header reads the
 * user with `auth()` (server component), which would otherwise force every
 * route in the app to be dynamic and break the static prerender of
 * `/docs/[slug]`.
 */
export default function ChromeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-outline-soft bg-surface/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-baseline gap-3 lg:gap-8">
            <BrandWordmark href="/" />
            <AppNav />
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <HeaderUserArea />
          </div>
        </div>
      </header>
      <OnboardingBanner />
      <OnboardingRedirect />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
      <Footer />
    </>
  );
}
