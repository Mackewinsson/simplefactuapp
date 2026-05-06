import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Bienvenido</h1>
      <p className="mb-6 text-gray-600">
        Crea y gestiona tus facturas con Verifactu.
      </p>
      <ul className="flex flex-col gap-2">
        <li>
          <Link
            href="/invoices"
            className="text-blue-600 hover:underline"
          >
            Ver facturas
          </Link>
        </li>
        <li>
          <Link
            href="/invoices/new"
            className="text-blue-600 hover:underline"
          >
            Crear nueva factura
          </Link>
        </li>
      </ul>
    </div>
  );
}
