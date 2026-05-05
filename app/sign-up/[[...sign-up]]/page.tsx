import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

/**
 * Sign-up page with an explicit legal disclaimer above the Clerk component.
 * Clerk's prebuilt component does not support injecting custom required
 * fields, so we make the consent visible at the moment of registration:
 * by completing the form the user accepts the terms.
 *
 * For a full opt-in checkbox we would need Clerk's "Build your own" flow
 * with @clerk/elements; that is documented in INTEGRATION.md as the
 * follow-up if a regulator requires it.
 */
export default function SignUpPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 py-8">
      <SignUp />
      <p className="text-center text-xs leading-relaxed text-gray-600">
        Al crear una cuenta aceptas los{" "}
        <Link href="/legal/terminos" className="underline hover:text-gray-900">
          Términos y condiciones
        </Link>
        , la{" "}
        <Link href="/legal/privacidad" className="underline hover:text-gray-900">
          Política de privacidad
        </Link>{" "}
        y el{" "}
        <Link href="/legal/dpa" className="underline hover:text-gray-900">
          Contrato de encargado de tratamiento (DPA)
        </Link>
        .
      </p>
    </div>
  );
}
