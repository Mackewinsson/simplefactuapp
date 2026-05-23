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
    <div className="space-y-6 font-display animate-fade-in-up">
      <div>
        <Link href="/invoices" className="inline-flex items-center gap-1.5 text-xs font-bold text-fg-subtle hover:text-fg transition-colors group mb-3">
          <span className="transform group-hover:-translate-x-0.5 transition-transform">←</span> Volver a facturas
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3.5xl font-black tracking-tight text-fg">Productos y Servicios</h1>
            <p className="mt-1.5 text-sm text-fg-muted font-sans font-medium">
              Catálogo reutilizable de conceptos al añadir líneas en tus facturas Verifactu.
            </p>
          </div>
          <Link
            href="/invoices/new"
            className="btn btn-sm btn-primary rounded-xl px-5 py-2.5 font-bold shadow-md hover:-translate-y-[0.5px] transition-all shrink-0"
          >
            Nueva factura
          </Link>
        </div>
      </div>
      <ProductList products={products} />
    </div>
  );
}
