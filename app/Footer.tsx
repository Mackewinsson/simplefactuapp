import Link from "next/link";

/**
 * Persistent footer with legal links and titular identification.
 * Required by LSSI-CE art. 10 (visible identification of the service
 * provider) and recommended by GDPR for transparent communication.
 */
export function Footer() {
  // Single source of truth for the holder's identity. When the founder fills
  // these placeholders, every page that imports Footer updates at once.
  const titularName =
    process.env.NEXT_PUBLIC_TITULAR_RAZON_SOCIAL?.trim() || "((RAZÓN_SOCIAL))";
  const titularNif = process.env.NEXT_PUBLIC_TITULAR_NIF?.trim() || "((NIF_TITULAR))";
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-xs text-gray-600 md:flex-row md:items-center md:justify-between">
        <div>
          © {year} <span className="font-medium text-gray-800">{titularName}</span>
          {titularNif !== "((NIF_TITULAR))" ? (
            <>
              {" · "}
              <span className="font-mono">NIF {titularNif}</span>
            </>
          ) : null}
          {" · "}
          <span>Servicio compatible con Veri*Factu (AEAT)</span>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/legal/aviso-legal" className="hover:text-gray-900">
            Aviso legal
          </Link>
          <Link href="/legal/privacidad" className="hover:text-gray-900">
            Privacidad
          </Link>
          <Link href="/legal/terminos" className="hover:text-gray-900">
            Términos
          </Link>
          <Link href="/legal/dpa" className="hover:text-gray-900">
            DPA
          </Link>
          <Link href="/legal/cookies" className="hover:text-gray-900">
            Cookies
          </Link>
          <Link href="/legal/cancelacion" className="hover:text-gray-900">
            Cancelación
          </Link>
          <Link href="/legal/accesibilidad" className="hover:text-gray-900">
            Accesibilidad
          </Link>
        </nav>
      </div>
    </footer>
  );
}
