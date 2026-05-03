import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { isUserAdmin } from "@/lib/auth/admin";

export async function AppNav() {
  const { userId } = await auth();
  const showAdmin = userId ? await isUserAdmin(userId) : false;

  const c = "text-gray-600 hover:text-gray-900";

  return (
    <nav className="flex gap-6">
      <Link href="/" className={c}>
        Inicio
      </Link>
      <Link href="/invoices" className={c}>
        Facturas
      </Link>
      <Link href="/invoices/new" className={c}>
        Nueva factura
      </Link>
      <Link href="/customers" className={c}>
        Clientes
      </Link>
      <Link href="/products" className={c}>
        Productos
      </Link>
      <Link href="/settings/verifactu" className={c}>
        Verifactu
      </Link>
      {showAdmin ? (
        <Link href="/admin" className={c}>
          Administración
        </Link>
      ) : null}
    </nav>
  );
}
