import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductList } from "./ProductList";

export default async function ProductsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const products = await prisma.product.findMany({
    where: { userId },
    orderBy: { description: "asc" },
    select: {
      id: true,
      description: true,
      unitPriceCents: true,
      tipoImpositivo: true,
      claveRegimen: true,
      calificacion: true,
    },
  });

  return (
    <div>
      <div className="mb-6">
        <Link href="/invoices" className="text-gray-600 hover:text-gray-900">
          ← Volver a facturas
        </Link>
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Productos</h1>
        <Link
          href="/invoices/new"
          className="rounded bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Nueva factura (catálogo)
        </Link>
      </div>
      <p className="mb-4 text-sm text-gray-600">
        Catálogo reutilizable al añadir líneas en una factura.
      </p>
      <ProductList products={products} />
    </div>
  );
}
