import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function PublicHomePage() {
  const { userId } = await auth();
  if (userId) redirect("/invoices");

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:py-16">
      <section className="rounded border border-gray-200 bg-white p-6 sm:p-10">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          Facturacion simple y compatible con Veri*Factu
        </h1>
        <p className="mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
          Crea, envia y gestiona facturas con una experiencia clara para pymes y
          autonomos.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/sign-up"
            className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Crear cuenta
          </Link>
          <Link
            href="/sign-in"
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Iniciar sesion
          </Link>
          <Link
            href="/docs"
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Ver documentacion
          </Link>
        </div>
      </section>
    </main>
  );
}
