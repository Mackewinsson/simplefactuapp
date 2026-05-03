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
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Iniciar sesión
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button
            type="button"
            className="ml-3 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
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
