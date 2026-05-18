"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BrandWordmark } from "./BrandWordmark";

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4">
      <div className="mb-8">
        <BrandWordmark />
      </div>
      <p className="mb-2 text-xs font-medium uppercase tracking-widest text-fg-subtle">
        Error
      </p>
      <h1 className="mb-3 text-2xl font-semibold text-fg">Algo ha ido mal</h1>
      <p className="mb-8 max-w-sm text-center text-sm text-fg-muted">
        Ha ocurrido un error inesperado. Puedes intentarlo de nuevo o volver al inicio.
        {error.digest && (
          <span className="mt-2 block font-mono text-xs text-fg-subtle">
            ref: {error.digest}
          </span>
        )}
      </p>
      <div className="flex gap-3">
        <button onClick={reset} className="btn btn-md btn-primary">
          Intentar de nuevo
        </button>
        <Link href="/" className="btn btn-md btn-secondary">
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
