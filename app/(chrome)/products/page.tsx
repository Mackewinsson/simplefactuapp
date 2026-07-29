import { prisma } from "@/lib/prisma";
import { requireAppUser } from "@/lib/auth/app-user";
import { ProductCatalog } from "./ProductCatalog";

export default async function ProductsPage() {
  const { userId } = await requireAppUser();

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
