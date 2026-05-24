import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCatalog } from "./ProductCatalog";

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

  return <ProductCatalog products={products} />;
}
