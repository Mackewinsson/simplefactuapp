"use client";

import { useEffect } from "react";

/**
 * Root-level error boundary (Next.js). Must define its own <html> and <body>.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col items-center justify-center bg-[#f8fafc] px-4 font-sans text-[#0f172a]">
        <p className="mb-2 text-xs font-medium uppercase tracking-widest text-[#64748b]">
          Error
        </p>
        <h1 className="mb-3 text-2xl font-semibold">Algo ha ido mal</h1>
        <p className="mb-8 max-w-sm text-center text-sm text-[#475569]">
          Ha ocurrido un error inesperado en la aplicación.
          {error.digest ? (
            <span className="mt-2 block font-mono text-xs text-[#94a3b8]">
              ref: {error.digest}
            </span>
          ) : null}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded bg-[#0f172a] px-4 py-2 text-sm font-medium text-white hover:bg-[#1e293b]"
          >
            Intentar de nuevo
          </button>
          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            className="rounded border border-[#cbd5e1] px-4 py-2 text-sm font-medium text-[#334155] hover:bg-white"
          >
            Ir al inicio
          </button>
        </div>
      </body>
    </html>
  );
}
