import { prisma } from "@/lib/prisma";
import { requireAppUser } from "@/lib/auth/app-user";
import { CustomerCatalog } from "./CustomerCatalog";

export default async function CustomersPage() {
  const { userId } = await requireAppUser();

  const customers = await prisma.customer.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      nif: true,
      email: true,
      tipoPersona: true,
      idScheme: true,
      idType: true,
      codigoPais: true,
      foreignId: true,
    },
  });

  return <CustomerCatalog customers={customers} />;
}
