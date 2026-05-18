import Link from "next/link";
import { BrandWordmark } from "./BrandWordmark";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4">
      <div className="mb-8">
        <BrandWordmark />
      </div>
      <p className="mb-2 text-xs font-medium uppercase tracking-widest text-fg-subtle">
        404
      </p>
      <h1 className="mb-3 text-2xl font-semibold text-fg">Página no encontrada</h1>
      <p className="mb-8 max-w-sm text-center text-sm text-fg-muted">
        La URL que buscas no existe o ha sido movida.
      </p>
      <div className="flex gap-3">
        <Link href="/" className="btn btn-md btn-primary">
          Ir al inicio
        </Link>
        <Link href="/docs" className="btn btn-md btn-secondary">
          Ver docs
        </Link>
      </div>
    </div>
  );
}
