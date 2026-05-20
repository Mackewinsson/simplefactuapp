import Link from "next/link";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Bienvenido</h1>
      <p className="mb-6 text-fg-muted">
        Crea y gestiona tus facturas con Verifactu.
      </p>
      <ul className="flex flex-col gap-2">
        <li>
          <Link href="/invoices" className="text-accent hover:underline">
            Ver facturas
          </Link>
        </li>
        <li>
          <Link href="/invoices/new" className="text-accent hover:underline">
            Crear nueva factura
          </Link>
        </li>
      </ul>
    </div>
  );
}
