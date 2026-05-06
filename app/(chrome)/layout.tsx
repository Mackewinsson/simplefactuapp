import type { ReactNode } from "react";
import { AppNav } from "../AppNav";
import { HeaderUserArea } from "../HeaderUserArea";
import { Footer } from "../Footer";
import { OnboardingBanner } from "../OnboardingBanner";

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
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
      <Footer />
    </>
  );
}
