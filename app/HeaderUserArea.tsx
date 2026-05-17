"use client";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

export function HeaderUserArea() {
  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <button
            type="button"
            className="text-sm font-medium text-fg-muted hover:text-fg"
          >
            Iniciar sesión
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button
            type="button"
            className="btn btn-sm btn-secondary ml-3"
          >
            Registrarse
          </button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </>
  );
}
